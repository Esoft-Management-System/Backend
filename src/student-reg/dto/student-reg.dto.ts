import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString,}  from "class-validator";

export class StudentRegDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your E Number' })
  @IsString()
  eNumber: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your contact number' })
  @IsString()
  contactNumber: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your date of birth' })
  @IsDateString({}, { message: 'Please enter a valid date (YYYY-MM-DD' })
  dateOfBirth: Date;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your NIC' })
  @IsString()
  nic: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  emailAddress: string;

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

