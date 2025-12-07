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
  StudentRegistration,
  StudentRegistrationDocument,
} from './Schemas/student-reg.schema';
import { Model } from 'mongoose';
import { StudentRegDto } from './dto/student-reg.dto';
import { encryptPassword } from 'src/utilities/auth/bcrypt.util';
import { MailerService } from '../../mailer/mailer.service';

@Injectable()
export class StudentRegService {
  constructor(
    @InjectModel(StudentRegistration.name)
    private readonly studentRegModel: Model<StudentRegistrationDocument>,
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

  //================================= Create Student Registration ====================================
  async create(dto: StudentRegDto): Promise<StudentRegistration> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const existingEmail = await this.studentRegModel.findOne({
      emailAddress: dto.emailAddress,
    });
    if (existingEmail) {
      throw new BadRequestException('Email already registered.');
    }

    const existingENumber = await this.studentRegModel.findOne({
      eNumber: dto.eNumber,
    });
    if (existingENumber) {
      throw new BadRequestException('E-Number already registered.');
    }

    try {
      const hashedPassword = await encryptPassword(dto.password);

      const student = new this.studentRegModel({
        eNumber: dto.eNumber,
        fullName: dto.fullName,
        contactNumber: dto.contactNumber,
        dateOfBirth: new Date(dto.dateOfBirth),
        nic: dto.nic,
        emailAddress: dto.emailAddress,
        address: dto.address,
        password: hashedPassword,
      });

      const saved = await student.save();

      try {
        const html = await this.renderTemplate(
          'student-registration-success.template.html',
          {
            fullName: saved.fullName,
            eNumber: saved.eNumber,
            emailAddress: saved.emailAddress,
            contactNumber: saved.contactNumber,
          },
        );

        await this.mailer.sendMail({
          to: saved.emailAddress,
          subject: 'Your student registration is confirmed',
          html,
        });
      } catch (err) {
        console.error('Failed to send student registration email', err);
      }

      return saved;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later.',
      );
    }
  }

  //================================= Get All Students ====================================
  async findAll(): Promise<StudentRegistration[]> {
    return this.studentRegModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  //================================= Get Student By ID ====================================
  async findOne(id: string): Promise<StudentRegistration> {
    const student = await this.studentRegModel
      .findById(id)
      .select('-password')
      .exec();
    if (!student) {
      throw new NotFoundException('Student not found.');
    }
    return student;
  }

  //================================= Get Student By E-Number ====================================
  async findByENumber(eNumber: string): Promise<StudentRegistration> {
    const student = await this.studentRegModel
      .findOne({ eNumber })
      .select('-password')
      .exec();
    if (!student) {
      throw new NotFoundException('Student not found.');
    }
    return student;
  }

  //================================= Delete Student ====================================
  async delete(id: string): Promise<StudentRegistration> {
    const deleted = await this.studentRegModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Student not found.');
    }
    return deleted;
  }
}
