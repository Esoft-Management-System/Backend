import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  StaffRequest,
  StaffRequestSchema,
} from '../staff/staff-request/schemas/staff-request.schema';
import { UserService } from 'src/users/users.service';
import { TempPasswordModule } from './temporary-password/temporary-password.module';
import { StudentRegistration, StudentRegistrationSchema } from 'src/student/student-reg/Schemas/student-reg.schema';
import { StudentJWTStrategy } from './strategies/student-jwt.strategy';
import { StudentServices } from 'src/users/student.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: StaffRequest.name, schema: StaffRequestSchema },
      { name: StudentRegistration.name, schema: StudentRegistrationSchema}
    ]),
    TempPasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, StudentJWTStrategy, UserService , StudentServices],
  exports: [AuthService],
})
export class AuthModule {}
