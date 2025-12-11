import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestForgotPasswordDto {
  @ApiProperty({
    type: String,
    example: '',
    description: 'Student Or staff Email Address',
  })
  @IsNotEmpty({ message: ' Staff or Student Email Address is required' })
  @IsString()
  email: string;
}
