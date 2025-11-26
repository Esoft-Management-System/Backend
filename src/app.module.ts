import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

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
  ],
})
export class AppModule {}
