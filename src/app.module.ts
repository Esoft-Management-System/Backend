import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { StaffRequestModule } from './staff-request/staff-request.module';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { MailerModule } from './mailer/mailer.module';

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
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
