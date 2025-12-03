import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, MinLength, IsDateString,} from 'class-validator';

export class CreateStudentRegDto {
    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your student ID' })
    @IsString()
    ENumber: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your full name' })
    @IsString()
    FullName: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your contact number' })
    @IsString()
    ContactNumber: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your date of birth' })
    @IsDateString({}, {message: 'Plese enter a vaild date (YYYY-MM-DD)'})
    DateOfBirth: Date;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your NIC' })
    @IsString()
    NIC: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your email address' })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    EmailAddress: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your address' })
    @IsString()
    Address: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please enter your password' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    Password: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Please confirm your password' })
    @IsString()
    ConfirmPassword: string;
}