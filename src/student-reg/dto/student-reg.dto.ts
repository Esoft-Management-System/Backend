import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString,}  from "class-validator";

export class StudentRegDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your student ID' })
  @IsString()
  eNumber: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your contact number' })
  @IsDateString()
  contactNo: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your date of birth' })
  @IsDateString({}, { message: 'Please enter a valid date (YYYY-MM-DD' })
  dateOfBirth: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your address' })
  @IsString()
  address: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your password' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your confirm your password' })
  @IsString()
  confirmPassword: string;
}

