import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { MailerModule } from 'src/mailer/mailer.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffRequest, StaffRequestSchema } from 'src/staff/staff-request/schemas/staff-request.schema';
import { TempPasswordController } from './temporary-password.controller';
import { TempPasswordService } from './temporary-password.service';

@Module({
  imports: [
    JwtModule.register({}), // reuse global config or inject secrets via env
    MailerModule,
    MongooseModule.forFeature([
      { name: StaffRequest.name, schema: StaffRequestSchema },
    ]),
  ],
  controllers: [TempPasswordController],
  providers: [TempPasswordService, UserService],
  exports: [TempPasswordService],
})
export class TempPasswordModule {}