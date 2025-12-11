import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentRegistrationDocument = StudentRegistration & Document;

@Schema({ timestamps: true })
export class StudentRegistration {
  @Prop({ required: true, unique: true })
  eNumber: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  nic: string;

  @Prop({ required: true, unique: true })
  emailAddress: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: undefined })
  forgotPasswordCodeHash?: string;

  @Prop({ default: undefined })
  forgotPasswordCodeExpiresAt?: Date;

  @Prop({ default: 0 })
  forgotPasswordFailedAttempts?: number;


  
}
export const StudentRegistrationSchema =
  SchemaFactory.createForClass(StudentRegistration);
