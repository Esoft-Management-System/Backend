import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, isString, IsString } from 'class-validator';

export class CreateStaffRequestDto {
  @ApiProperty({ example: 'E-020189' })
  @IsNotEmpty({ message: 'Please enter your staff ID' })
  @IsString()
  staffId: string;

  @ApiProperty({ example: 'Harishanth' })
  @IsNotEmpty({ message: 'Please enter your name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Visiting Leacturer' })
  @IsNotEmpty({ message: 'Please enter your designation' })
  @IsString()
  designation: string;

  @ApiProperty({ example: 'harishanth08gmail.com' })
  @IsNotEmpty({ message: 'Please enter your email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: 'Need to mark the attendance' })
  @IsNotEmpty({ message: 'Please enter the reason for the request' })
  @IsString()
  reason: string;
}
