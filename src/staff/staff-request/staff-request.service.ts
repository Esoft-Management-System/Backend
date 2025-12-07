import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import {
  StaffRequest,
  StaffRequestDocument,
} from './schemas/staff-request.schema';
import { Model } from 'mongoose';
import { CreateStaffRequestDto } from './dto/create-staff-request.dto';
import { MailerService } from '../../mailer/mailer.service';
import { generatePassword } from '../../users/users-password';
import { encryptPassword } from '../../utilities/auth/bcrypt.util';

@Injectable()
export class StaffRequestService {
  constructor(
    @InjectModel(StaffRequest.name)
    private readonly StaffRequestModel: Model<StaffRequestDocument>,
    private readonly mailer: MailerService,
  ) {}

  private resolveTemplatePath(fileName: string): string {
    const distPath = path.join(
      process.cwd(),
      'dist',
      'email-templates',
      fileName,
    );
    if (existsSync(distPath)) return distPath;

    return path.join(process.cwd(), 'src', 'email-templates', fileName);
  }

  private async renderTemplate(
    fileName: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const templatePath = this.resolveTemplatePath(fileName);
    const content = await readFile(templatePath, 'utf-8');

    return Object.entries(variables).reduce((acc, [key, value]) => {
      const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
      return acc.replace(pattern, value ?? '');
    }, content);
  }

  //================================= Create staff Request ====================================
  async create(dot: CreateStaffRequestDto): Promise<StaffRequest> {
    const existing = await this.StaffRequestModel.findOne({
      staffId: dot.staffId,
      email: dot.email,
    });

    if (existing) {
      throw new BadRequestException(
        'A request already exists for this Staff ID and Email. Please wait for approval.',
      );
    }

    try {
      const request = new this.StaffRequestModel({
        ...dot,
        role: dot.role ?? 'staff',
        requestDate: new Date(),
        approved: false,
      });

      return await request.save();
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Something went wrong. please try again later.',
      );
    }
  }

  //================================= Get all staff Requests ====================================
  async findAll(): Promise<StaffRequest[]> {
    return this.StaffRequestModel.find().sort({ createdAt: -1 }).exec();
  }

  //================================= Approve staff Request ====================================
  async approve(id: string): Promise<StaffRequest> {
    const request = await this.StaffRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    const password = generatePassword(10);
    const passwordHash = await encryptPassword(password);
    request.approved = true;
    request.passwordHash = passwordHash;
    const update = await request.save();
    try {
      const html = await this.renderTemplate(
        'approve-request.template.html',
        {
          fullName: update.fullName,
          role: update.role,
          staffId: update.staffId,
          password,
        },
      );

      await this.mailer.sendMail({
        to: update.email,
        subject: 'Your access request has been approved',
        html,
      });
    } catch (err) {
      console.error('Failed to send approval email', err);
    }
    return update;
  }

  //================================= Delete staff Request ====================================
  async rejectStaffRequest(
    id: string,
    reason = 'Your request was not approved at this time.',
  ): Promise<StaffRequest> {
    const request = await this.StaffRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.approved = false;
    const update = await request.save();

    try {
      const html = await this.renderTemplate('reject-request.template.html', {
        fullName: update.fullName,
        role: update.role,
        staffId: update.staffId,
        reason,
      });

      await this.mailer.sendMail({
        to: update.email,
        subject: 'Your access request was not approved',
        html,
      });
    } catch (err) {
      console.error('Failed to send rejection email', err);
    }

    return update;
  }
}
