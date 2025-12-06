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

@Injectable()
export class StaffRequestService {
  constructor(
    @InjectModel(StaffRequest.name)
    private readonly StaffRequestModel: Model<StaffRequestDocument>,
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
    const update = await this.StaffRequestModel.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true },
    ).exec();

    if (!update) {
      throw new NotFoundException('Request not found');
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
