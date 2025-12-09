import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StudentRegistration,
  StudentRegistrationDocument,
} from 'src/student/student-reg/Schemas/student-reg.schema';

@Injectable()
export class StudentServices {
  constructor(
    @InjectModel(StudentRegistration.name)
    private readonly staffModel: Model<StudentRegistrationDocument>,
    @InjectModel(StudentRegistration.name)
    private readonly studentModel: Model<StudentRegistrationDocument>,
  ) {}

  //==================================== Student ===================================
  async findByENumber(eNumber: string, opts?: { lean?: boolean }) {
    if (opts?.lean) {
      return this.studentModel.findOne({ eNumber }).lean();
    }

    return this.studentModel.findOne({ eNumber });
  }

  async findStudentById(id: string) {
    return this.studentModel.findById(id);
  }

  async updateStudentPasswordHash(id: string, password: string) {
    return this.studentModel.findByIdAndUpdate(
      id,
      {
        password,
      },
      {
        new: true,
      },
    );
  }
}
