import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class ResendForgotPasswordDto {
  @ApiProperty({ description: 'Forgot-password session token', example: '<jwt>' })
  @IsJWT()
  forgotSessionToken: string;
}
