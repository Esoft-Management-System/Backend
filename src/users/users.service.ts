import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StaffRequest,
  StaffRequestDocument,
} from 'src/staff/staff-request/schemas/staff-request.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(StaffRequest.name)
    private readonly staffModel: Model<StaffRequestDocument>,
  ) {}

  async findByStaffId(staffId: string) {
    return this.staffModel.findOne({ staffId }).lean();
  }
}
