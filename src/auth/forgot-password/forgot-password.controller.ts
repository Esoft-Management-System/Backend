import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForgotPasswordService } from './forgot-password.service';
import { RequestForgotPasswordDto } from './dto/request-forgot-password.dto';
import { ResendForgotPasswordDto } from './dto/resend-forgot-password.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot.password.dto';
import { SetNewForgotPasswordDto } from './dto/set-new-forgot-password.dto';

@ApiTags('auth/forgot-password')
@Controller('auth/forgot-password')
export class ForgotPasswordController {
	constructor(private readonly service: ForgotPasswordService) {}

	@Post('request')
	request(@Body() dto: RequestForgotPasswordDto) {
		return this.service.requestCode(dto);
	}

	@Post('resend')
	resend(@Body() dto: ResendForgotPasswordDto) {
		return this.service.resendCode(dto);
	}

	@Post('verify')
	verify(@Body() dto: VerifyForgotPasswordDto) {
		return this.service.verifyCode(dto);
	}

	@Post('reset')
	reset(@Body() dto: SetNewForgotPasswordDto) {
		return this.service.resetPassword(dto);
	}
}
