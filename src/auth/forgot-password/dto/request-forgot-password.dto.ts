import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';

export class RequestForgotPasswordDto {
    @ApiProperty({
        type: String,
        example:'',
        description: 'Student E-number Or staff ID or Email Address',
    })
    @IsNotEmpty({message: 'E-number Or staff ID or Email Address is required'})
    @IsString()
    email: string;
}