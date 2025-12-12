import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString, Length} from 'class-validator';

export class VerifyForgotPasswordDto {
    @ApiProperty({
        type: String,
        example: '',
        description: '6-digit verification code sent to email',
    })
    @IsNotEmpty({message: 'Verification code is required'})
    @IsString()
    @Length(6, 6, {message: 'Code must be exactly 6 digits'})
    verificationCode: string;

    @ApiProperty({
        type: String,
        description: 'Temporary verification token from',
    })
    @IsNotEmpty()
    @IsString()
    verificationToken: string;

}