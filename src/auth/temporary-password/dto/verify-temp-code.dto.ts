import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, Length } from 'class-validator';
export class VerifyTempCodeDto {
  @ApiProperty({ description: 'Temporary session JWT from /auth/login', example: '<jwt>' })
  @IsJWT()
  temporarySessionToken: string;

  @ApiProperty({ description: '6-digit verification code sent by email', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
