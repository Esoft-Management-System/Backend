import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
import { UserService } from 'src/users/users.service';
import {
  decryptPassword,
  encryptPassword,
} from 'src/utilities/auth/bcrypt.util';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TempPasswordService {
  private readonly codeExpiryMinutes = 10;

  constructor(
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly users: UserService,
  ) {}

  private resolveTemplatePath(fileName: string): string {
    const distPath = path.join(
      process.cwd(),
      'dist',
      'email-templates',
      fileName,
    );
    if (existsSync(distPath)) return distPath;
    return path.join(process.cwd(), 'src', 'email-templates', fileName);
  }

  private async renderTemplate(
    fileName: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const templatePath = this.resolveTemplatePath(fileName);
    const content = await readFile(templatePath, 'utf-8');
    return Object.entries(variables).reduce((acc, [key, value]) => {
      const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
      return acc.replace(pattern, value ?? '');
    }, content);
  }

  private assertTempSession(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: process.env.STAFF_JWT_SECRET,
      });
      if (payload.purpose !== 'temp-password') throw new Error('bad purpose');
      return payload.sub as string;
    } catch {
      throw new UnauthorizedException('Invalid or expired temporary session');
    }
  }

  async sendCode(temporarySessionToken: string) {
    const userId = this.assertTempSession(temporarySessionToken);
    const user = await this.users.findById(userId);
    if (!user || !user.isPasswordTemporary) {
      throw new BadRequestException('Temporary password not required');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempPasswordCodeHash = await encryptPassword(code);
    user.tempPasswordCodeExpiresAt = new Date(
      Date.now() + this.codeExpiryMinutes * 60 * 1000,
    );
    user.tempPasswordFailedAttempts = 0;
    await user.save();

    const html = await this.renderTemplate('verification-code.template.html', {
      fullName: user.fullName,
      code,
      expiresIn: `${this.codeExpiryMinutes} minutes`,
      supportEmail: 'support@esoft.com',
      year: `${new Date().getFullYear()}`,
    });

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Your verification code',
      html,
    });

    return { expiresInSeconds: 600 };
  }

  async verifyCode(temporarySessionToken: string, code: string) {
    const userId = this.assertTempSession(temporarySessionToken);
    const user = await this.users.findById(userId);
    if (
      !user ||
      !user.tempPasswordCodeHash ||
      !user.tempPasswordCodeExpiresAt
    ) {
      throw new BadRequestException('No code to verify');
    }
    if (user.tempPasswordCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Code expired');
    }

    const ok = await decryptPassword(code, user.tempPasswordCodeHash);
    if (!ok) {
      user.tempPasswordFailedAttempts =
        (user.tempPasswordFailedAttempts || 0) + 1;
      await user.save();
      throw new BadRequestException('Invalid code');
    }

    const resetToken = await this.jwt.signAsync(
      { sub: user._id.toString(), purpose: 'temp-password-reset' },
      { secret: process.env.STAFF_JWT_SECRET, expiresIn: '15m' },
    );

    return { resetToken };
  }

  async setNewPassword(
    resetToken: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    let userId: string;
    try {
      const payload = this.jwt.verify(resetToken, {
        secret: process.env.STAFF_JWT_SECRET,
      });
      if (payload.purpose !== 'temp-password-reset')
        throw new Error('bad purpose');
      userId = payload.sub as string;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.users.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    user.passwordHash = await encryptPassword(newPassword);
    user.isPasswordTemporary = false;
    user.tempPasswordCodeHash = undefined;
    user.tempPasswordCodeExpiresAt = undefined;
    user.tempPasswordFailedAttempts = 0;
    await user.save();

    const html = await this.renderTemplate('password-changed.template.html', {
      fullName: user.fullName,
      staffId: user.staffId,
      loginUrl: `${process.env.APP_URL ?? ''}`,
      supportEmail: 'support@esoft.com',
      year: `${new Date().getFullYear()}`,
    });

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Password changed successfully',
      html,
    });

    return {
      message: 'Password updated. Please sign in with your new password.',
    };
  }
}
