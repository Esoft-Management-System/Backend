import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StaffRequestDocument = StaffRequest & Document;

@Schema({ timestamps: true })
export class StaffRequest {
  @Prop({ required: true })
  staffId: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, default: () => new Date() })
  requestDate: Date;

  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'staff' })
  role: 'staff' | 'admin';

  @Prop()
  passwordHash?: string;

  @Prop({ default: false })
  approved: boolean;

  @Prop({ default: false })
  isPasswordTemporary?: boolean;

  @Prop()
  tempPasswordCodeHash?: string;

  @Prop()
  tempPasswordCodeExpiresAt?: Date;

  @Prop({ default: 0 })
  tempPasswordFailedAttempts?: number;

  @Prop({ default: undefined })
  forgotPasswordCodeHash?: string;

  @Prop({ default: undefined })
  forgotPasswordCodeExpiresAt?: Date;

  @Prop({ default: 0 })
  forgotPasswordFailedAttempts?: number;
}

export const StaffRequestSchema = SchemaFactory.createForClass(StaffRequest);
