import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordService } from './forgot-password.service';
import { RequestForgotPasswordDto } from './dto/reset-request.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forget-code.dto';
import { SetNewForgotPasswordDto } from './dto/reset-new-password.dto';

@ApiTags('auth/forgot-password')
@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly service: ForgotPasswordService) {}

  @Post('request')
  @ApiOperation({
    summary: 'Request password reset code',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Verification code sent to your email',
        verificationToken: '<jwt>',
        expiresInSeconds: 600,
      },
    },
  })
  requestCode(@Body() dto: RequestForgotPasswordDto) {
    return this.service.requestForgotPasswordCode(dto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify 6-digit code and get reset token',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Code verified successfully',
        resetToken: '<jwt>',
      },
    },
  })
  verifyCode(@Body() dto: VerifyForgotPasswordDto) {
    return this.service.verifyForgotPasswordCode(dto);
  }

  @Post('set-new')
  @ApiOperation({
    summary: 'Set new password after code verification',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message:
          'Password has been reset successfully. Please log in with your new password.',
      },
    },
  })
  setNewPassword(@Body() dto: SetNewForgotPasswordDto) {
    return this.service.setNewPassword(dto);
  }
}