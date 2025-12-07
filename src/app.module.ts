import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { AdminAuthMiddleware } from './common/middlewares/admin-auth.middleware';
import { MailerModule } from './mailer/mailer.module';
import { StaffRequestModule } from './staff/staff-request/staff-request.module';
import { StudentRegModule } from './student/student-reg/student-registration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      connectionFactory: (connection: Connection) => {
        console.log('MongoDB Connected Successfully!');
        return connection;
      },
    }),
    JwtModule.register({}), // makes JwtService available for middleware
    AuthModule,
    StaffRequestModule,
    MailerModule,
    StudentRegModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AdminAuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        { path: 'staff-requests/:id/approve', method: RequestMethod.PATCH },
        { path: 'staff-requests/:id/reject', method: RequestMethod.PATCH },
      );
  }
}
