import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class sendMailDto {
  @ApiProperty({ example: '' })
  @IsEmail({}, { message: 'Invalid email address' })
  to: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  html?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  text?: string;
}
