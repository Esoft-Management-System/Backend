import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentRegDocument = StudentReg & Document;

@Schema({ timestamps: true })
export class StudentReg {
  @Prop({ required: true, unique: true })
  Enumber: string;

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
}

export const StudentRegSchema = SchemaFactory.createForClass(StudentReg);
