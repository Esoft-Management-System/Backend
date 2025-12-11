import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordService } from './forgot-password.service';
import { RequestForgetPasswordDto } from './dto/request-forgot.dto';
import { VerifyForgetDto } from './dto/verify-code.dto';
import { SetForgetPasswordDto } from './dto/set-forgot-password.dto';

@ApiTags('auth/forgot-password')
@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly service: ForgotPasswordService) {}

  @Post('request')
  @ApiOperation({
    summary: 'Step 1: Request password reset code (Student, Staff, Admin)',
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
  requestCode(@Body() dto: RequestForgetPasswordDto) {
    return this.service.requestForgotPasswordCode(dto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Step 2: Verify 6-digit code and get reset token',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Code verified successfully',
        resetToken: '<jwt>',
      },
    },
  })
  verifyCode(@Body() dto: VerifyForgetDto) {
    return this.service.verifyForgotPasswordCode(dto);
  }

  @Post('set-new')
  @ApiOperation({
    summary: 'Step 3: Set new password after code verification',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Password has been reset successfully. Please log in with your new password.',
      },
    },
  })
  setNewPassword(@Body() dto: SetForgetPasswordDto) {
    return this.service.setNewPassword(dto);
  }
}



