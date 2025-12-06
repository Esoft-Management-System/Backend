import { Module } from '@nestjs/common';
import { StaffRequestController } from './staff-request.controller';
import { StaffRequestService } from './staff-request.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StaffRequest,
  StaffRequestSchema,
} from './schemas/staff-request.schema';
import { MailerModule } from '../../mailer/mailer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffRequest.name, schema: StaffRequestSchema },
    ]),
    MailerModule,
  ],
  controllers: [StaffRequestController],
  providers: [StaffRequestService],
  exports: [StaffRequestService],
})
export class StaffRequestModule {}
