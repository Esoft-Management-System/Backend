import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      await this.mailer.sendMail({
        to: update.email,
        subject: 'Your access request has been approved',
        text: `Hello ${update.fullName},
    
    Your access request has been approved.
    
    Role: ${update.role}
    Staff ID: ${update.staffId}
    Password: ${password}
    
    Please change your password after first login.`,
      });
    } catch (err) {
      console.error('Failed to send approval email', err);
    }
    return update;
  }

  //================================= Delete staff Request ====================================
  async rejectStaffRequest(id: string): Promise<StaffRequest> {
    const update = await this.StaffRequestModel.findByIdAndUpdate(
      id,
      { approved: false },
      { new: true },
    ).exec();

    if (!update) {
      throw new NotFoundException('Request not found');
    }
    return update;
  }
}
