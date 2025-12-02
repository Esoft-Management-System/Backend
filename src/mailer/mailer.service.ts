import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    const host = process.env.MAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.MAIL_PORT || 465);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const secure = port === 465;

    this.logger.log(
      `Creating mail transporter host=${host} port=${port} secure=${secure}`,
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10_000, 
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
  }

  async onModuleInit() {
    try {
      const result = await this.transporter.verify();
      this.logger.log('Mailer transporter verified: ' + JSON.stringify(result));
    } catch (err: any) {
      this.logger.error(
        'Mailer transporter verification failed: ' +
          (err && err.message ? err.message : err),
      );
      this.logger.debug(err && err.stack ? err.stack : err);
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
  }) {
    const from = options.from || process.env.MAIL_FROM || process.env.MAIL_USER;
    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Mail sent: ${info.messageId}`);
      return { messageId: info.messageId, accepted: info.accepted };
    } catch (err: any) {
      this.logger.error(
        'Failed to send email: ' + (err && err.message ? err.message : err),
      );
      this.logger.debug(err && err.stack ? err.stack : err);
      throw new InternalServerErrorException('Failed to send email.');
    }
  }
}
