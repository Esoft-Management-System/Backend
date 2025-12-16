import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RequestForgotPasswordDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ enum: ['student', 'staff'], example: 'student' })
	@IsString()
	@IsNotEmpty()
	@IsIn(['student', 'staff'])
	role: 'student' | 'staff';
}