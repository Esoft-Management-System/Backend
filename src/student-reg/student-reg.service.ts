import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  StudentRegistration,
  StudentRegistrationDocument,
} from './Schemas/student-reg.schema';
import { Model } from 'mongoose';
import { StudentRegDto } from './dto/student-reg.dto';
import { encryptPassword } from '../utilities/auth/bcrypt.util';

@Injectable()
export class StudentRegService {
  constructor(
    @InjectModel(StudentRegistration.name)
    private readonly studentRegModel: Model<StudentRegistrationDocument>,
  ) {}

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

      return await student.save();
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
