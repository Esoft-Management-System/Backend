import { Module } from '@nestjs/common';
import { StudentRegService } from './student-reg.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StudentRegistration,
  StudentRegistrationSchema,
} from './Schemas/student-reg.schema';
import { StudentRegController } from './student-register.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentRegistration.name, schema: StudentRegistrationSchema },
    ]),
  ],
  controllers: [StudentRegController],
  providers: [StudentRegService],
  exports: [StudentRegService],
})
export class StudentRegModule {}
