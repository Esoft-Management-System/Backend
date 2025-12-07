import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';
export class RequestTempCodeDto {
  @ApiProperty({ description: 'Temporary session JWT returned from /auth/login when password is temporary' })
  @IsJWT()
  temporarySessionToken: string;
}
