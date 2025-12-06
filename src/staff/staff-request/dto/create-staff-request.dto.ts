import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffRequestDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your staff ID' })
  @IsString()
  staffId: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your designation' })
  @IsString()
  designation: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter your email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty({ message: 'Please enter the reason for the request' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'staff', enum: ['staff', 'admin'], default: 'staff' })
  @IsOptional()
  @IsString()
  @IsIn(['staff', 'admin'], { message: 'Role must be either staff or admin' })
  role?: 'staff' | 'admin';
}
