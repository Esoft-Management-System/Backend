import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class RequestForgetPasswordDto {
  @ApiProperty({ description: 'Email of Staff or Student', example: '' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
}


