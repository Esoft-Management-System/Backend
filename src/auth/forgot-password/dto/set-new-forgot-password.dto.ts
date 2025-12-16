import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, MinLength } from 'class-validator';

export class SetNewForgotPasswordDto {
  @ApiProperty({ description: 'Reset token returned after code verification', example: '<jwt>' })
  @IsJWT()
  resetToken: string;

  @ApiProperty({ minLength: 6, example: 'NewPass123' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ minLength: 6, example: 'NewPass123' })
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}
