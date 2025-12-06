import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class sendMailDto {
  @ApiProperty({ example: 'recipient@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  to: string;

  @ApiProperty({ example: 'Test Email' })
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @ApiProperty({ example: '<h1>Hello</h1>', required: false })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiProperty({ example: 'Hello', required: false })
  @IsOptional()
  @IsString()
  text?: string;
}
