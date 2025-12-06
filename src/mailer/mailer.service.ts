import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class MailerService {
  private logger = new Logger(MailerService.name);
  private apiInstance: Brevo.TransactionalEmailsApi;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) throw new Error('BREVO_API_KEY not set in env');

    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(0, apiKey);
  }

  async sendMail(data: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<boolean> {
    try {
      const sendData: Brevo.SendSmtpEmail = {
        sender: {
          email: this.config.get<string>('BREVO_SENDER_EMAIL'),
          name: 'Esoft Management',
        },
        to: [{ email: data.to }],
        subject: data.subject,
        htmlContent: data.html || undefined,
        textContent: data.text || undefined,
      };

      const response = await this.apiInstance.sendTransacEmail(sendData);
      this.logger.log('Email sent successfully: ' + JSON.stringify(response));
      return true;
    } catch (error: any) {
      this.logger.error(
        'ERROR SENDING EMAIL: ',
        error.response || error.message || error,
      );
      throw new InternalServerErrorException('Failed to send email.');
    }
  }
}
