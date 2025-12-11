import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, MinLength } from 'class-validator';

export class SetForgetPasswordDto {
  @ApiProperty({
    description: 'Reset token returned after verifying code',
    example: '',
  })
  @IsJWT()
  resetToken: string;

  @ApiProperty({ description: 'New password', minLength: 6, example: '' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    minLength: 6,
    example: '',
  })
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}