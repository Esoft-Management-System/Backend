import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, Length } from 'class-validator';

export class VerifyForgetDto {
  @ApiProperty({ description: 'OTP sent to email', example: '' })
  @IsJWT()
  resetToken: string;

  @ApiProperty({
    description: '6-digit verification code sent by email',
    example: '',
  })
  @IsString()
  @Length(6, 6)
  code: string;
}