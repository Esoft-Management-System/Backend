import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { MailerService } from './mailer.service';
import { sendMailDto } from './dto/send-mail.dto';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailer: MailerService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email (Brevo)' })
  @ApiResponse({ status: 200, description: 'Email sent' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiInternalServerErrorResponse({ description: 'Sending failed' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendTest(@Body() dto: sendMailDto) {
    const result = await this.mailer.sendMail({
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
    });
    return { message: 'Email sent', result };
  }
}
