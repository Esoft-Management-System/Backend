import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestTempCodeDto } from './dto/request-temp-code.dto';
import { VerifyTempCodeDto } from './dto/verify-temp-code.dto';
import { SetNewPasswordDto } from './dto/set-new-password.dto';
import { TempPasswordService } from './temporary-password.service';

@ApiTags('auth/temp-password')
@Controller('auth/temp-password')
export class TempPasswordController {
  constructor(private readonly svc: TempPasswordService) {}

  @Post('send-code')
  @ApiOperation({ summary: 'Send or resend verification code for temporary password reset' })
  @ApiOkResponse({ schema: { example: { expiresInSeconds: 600 } } })
  sendCode(@Body() dto: RequestTempCodeDto) {
    return this.svc.sendCode(dto.temporarySessionToken);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify 6-digit code and return short-lived reset token' })
  @ApiOkResponse({ schema: { example: { resetToken: '<jwt>' } } })
  verify(@Body() dto: VerifyTempCodeDto) {
    return this.svc.verifyCode(dto.temporarySessionToken, dto.code);
  }

  @Post('set')
  @ApiOperation({ summary: 'Set a new password using the reset token' })
  @ApiOkResponse({ schema: { example: { message: 'Password updated. Please sign in with your new password.' } } })
  set(@Body() dto: SetNewPasswordDto) {
    return this.svc.setNewPassword(
      dto.resetToken,
      dto.newPassword,
      dto.confirmNewPassword,
    );
  }
}
