import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateStudentRegDto {
  @ApiProperty({ example: 'E-100' })
  @IsNotEmpty({ message: 'Please enter your student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'Danu' })
  @IsNotEmpty({ message: 'Please enter your full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '200012345678' })
  @IsNotEmpty({ message: 'Please enter your NIC' })
  @IsString()
  nic: string;

  @ApiProperty({ example: 'Danu@example.com' })
  @IsNotEmpty({ message: 'Please enter your email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Please enter your password' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'Password@123' })
  @IsNotEmpty({ message: 'Please confirm your password' })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: '2002-01-01' })
  @IsNotEmpty({ message: 'Please enter your date of birth' })
  @IsDateString({}, { message: 'Please enter a valid date of birth' })
  dateOfBirth: string;

  @ApiProperty({ example: '209 esoft trincomalee' })
  @IsNotEmpty({ message: 'Please enter your address' })
  @IsString()
  address: string;
}
