import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, Length } from 'class-validator';

export class VerifyForgotPasswordDto {
  @ApiProperty({ description: 'Forgot-password session token', example: '<jwt>' })
  @IsJWT()
  forgotSessionToken: string;

  @ApiProperty({ description: '6-digit verification code sent to email', example: '123456', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  verificationCode: string;
}