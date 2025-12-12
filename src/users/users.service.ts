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

  //staff
  async findByStaffId(staffId: string, opts?: { lean?: boolean }) {
    if (opts?.lean) {
      return this.staffModel.findOne({ staffId }).lean();
    }
    return this.staffModel.findOne({ staffId });
  }

  async findByEmail(email: string) {
    return this.staffModel.findOne({ email });
  }

  async findById(id: string) {
    return this.staffModel.findById(id);
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    return this.staffModel.findByIdAndUpdate(
      id,
      {
        passwordHash,
        isPasswordTemporary: false,
        tempPasswordCodeHash: undefined,
        tempPasswordCodeExpiresAt: undefined,
        tempPasswordFailedAttempts: 0,
      },
      { new: true },
    );
  }
}