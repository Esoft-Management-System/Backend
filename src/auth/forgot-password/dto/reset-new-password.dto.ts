// src/auth/forgot-password/dto/set-new-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, MinLength } from 'class-validator';

export class SetNewForgotPasswordDto {
  @ApiProperty({
    description: 'Reset token returned after verifying code',
    example: '',
  })
  @IsJWT()
  resetToken: string;

  @ApiProperty({
    description: 'New password has minimum 6 characters',
    minLength: 6,
    example: '',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password has minimum 6 characters',
    minLength: 6,
    example: '',
  })
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}
