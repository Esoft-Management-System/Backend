import { Module } from '@nestjs/common';
import { StudentRegController } from './student-register.controller';
import { StudentRegService } from './student-reg.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StudentRegistration,
  StudentRegistrationSchema,
} from './dto/Schemas/student-reg.schema';

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
