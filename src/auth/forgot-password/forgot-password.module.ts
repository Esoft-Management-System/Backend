import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';
import { MailerModule } from 'src/mailer/mailer.module';
import { UserService } from 'src/users/users.service';
import { StudentServices } from 'src/users/student.service';
import {
    StaffRequest,
    StaffRequestSchema,
} from 'src/staff/staff-request/schemas/staff-request.schema';
import {
    StudentRegistration,
    StudentRegistrationSchema,
} from 'src/student/student-reg/Schemas/student-reg.schema';

@Module({
    imports: [
    JwtModule,
    MailerModule,
    MongooseModule.forFeature([
        { name: StaffRequest.name, schema: StaffRequestSchema },
        { name: StudentRegistration.name, schema: StudentRegistrationSchema },
    ]),
],
    controllers: [ForgotPasswordController],
    providers: [ForgotPasswordService, UserService, StudentServices],
})
export class ForgotPasswordModule {}