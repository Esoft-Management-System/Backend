import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsDateString } from "class-validator";

export class StudentRegDto {
    @ApiProperty({ example:'E001', description: 'Student Enrollment Number' })
    @IsNotEmpty()
    @IsString()
    enrollmentNumber: string;

    @ApiProperty({ example:'John Doe', description: 'Full Name of the Student' })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ example:'0771234567', description: 'Contact Number of the Student' })
    @IsNotEmpty()
    @IsString()
    contactNumber: string;
    
    @ApiProperty({ example:'2001-05-15', description: 'Date of Birth of the Student' })
    @IsNotEmpty()
    @IsDateString({},{message: 'Plese enter a vaild date (YYYY-MM-DD)'})
    dateOfBirth: Date;

    @ApiProperty({ example:'200012345678', description: 'NIC Number of the Student' })
    @IsNotEmpty({ message: 'Please enter your NIC' })
    @IsString()
    nicNumber: string;

    @ApiProperty({ example:'student@example.com', description: 'Email Address of the Student' })
    @IsNotEmpty()
    @IsEmail({}, { message: 'Please enter a valid email address' })
    email: string;

    @ApiProperty({ example:'123 Main St, Cityville', description: 'Residential Address of the Student' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({example:'Password123', description: 'Password for Student Account Creation'})
    @IsNotEmpty()
    @IsString()
    password: string;
}