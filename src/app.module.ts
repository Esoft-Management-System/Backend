import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { MailerModule } from './mailer/mailer.module';
import { StaffRequestModule } from './staff/staff-request/staff-request.module';
import { StudentRegModule } from './student/student-reg/student-registration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      connectionFactory: (connection: Connection) => {
        console.log('MongoDB Connected Successfully!');
        return connection;
      },
    }),
    StaffRequestModule,
    MailerModule,
    StudentRegModule
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
