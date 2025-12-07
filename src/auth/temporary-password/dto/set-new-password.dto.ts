import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, MinLength } from 'class-validator';
export class SetNewPasswordDto {
  @ApiProperty({ description: 'Reset token returned after verifying code', example: '<jwt>' })
  @IsJWT()
  resetToken: string;

  @ApiProperty({ description: 'New password', minLength: 8, example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password', minLength: 8, example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  confirmNewPassword: string;
}
