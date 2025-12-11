import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
import { UserService } from 'src/users/users.service';
import { StudentServices } from 'src/users/student.service';
import {
  decryptPassword,
  encryptPassword,
} from 'src/utilities/auth/bcrypt.util';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { RequestForgetPasswordDto } from './dto/request-forgot.dto';
import { VerifyForgetDto } from './dto/verify-code.dto';
import { SetForgetPasswordDto } from './dto/set-forgot-password.dto';

interface UserData {
  _id: string;
  email: string;
  fullName: string;
  forgotPasswordCodeHash?: string;
  forgotPasswordCodeExpiresAt?: Date;
  forgotPasswordFailedAttempts?: number;
  role: 'student' | 'staff' | 'admin';
  save(): Promise<void>;
}

@Injectable()
export class ForgotPasswordService {
  private readonly codeExpiryMinutes = 10;
  private readonly logger = new Logger(ForgotPasswordService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly userService: UserService,
    private readonly studentService: StudentServices,
  ) {}

  /**
   * STEP 1: Request verification code
   * Identifies user (Student/Staff/Admin) → Generates OTP → Sends email
   */
  async requestForgotPasswordCode(dto: RequestForgetPasswordDto) {
    // Auto-identify user type (student or staff)
    const { user: foundUser, userType } = await this.identifyUser(dto.email);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash and store code with 10 min expiry
    foundUser.forgotPasswordCodeHash = await encryptPassword(code);
    foundUser.forgotPasswordCodeExpiresAt = new Date(
      Date.now() + this.codeExpiryMinutes * 60 * 1000,
    );
    foundUser.forgotPasswordFailedAttempts = 0;
    await foundUser.save();

    this.logger.log(`Code saved for user ${foundUser._id}. Verification token created.`);

    // Render email template
    const html = await this.renderTemplate('verification-code.template.html', {
      fullName: foundUser.fullName,
      code,
      expiresIn: `${this.codeExpiryMinutes} minutes`,
      supportEmail: 'support@esoft.com',
      year: `${new Date().getFullYear()}`,
    });

    // Send email with error handling
    try {
      await this.mailer.sendMail({
        to: foundUser.emailAddress || foundUser.email,
        subject: 'Password Reset Verification Code',
        html,
      });
    } catch (emailError) {
      this.logger.error('Email sending failed, but code was saved', emailError);
      // Continue anyway - code is saved in database
    }

    // Create verification JWT token (15 min validity)
    const verificationToken = await this.jwt.signAsync(
      {
        sub: foundUser._id.toString(),
        userType,
        role: foundUser.role,
        purpose: 'forgot-password-verification',
      },
      {
        secret: this.getJwtSecret(userType, foundUser.role),
        expiresIn: '15m',
      },
    );

    this.logger.log(`Code sent to ${userType}: ${foundUser.emailAddress || foundUser.email}`);

    return {
      message: 'Verification code sent to your email',
      verificationToken,
      expiresInSeconds: this.codeExpiryMinutes * 60,
    };
  }

  /**
   * STEP 2: Verify 6-digit code
   * Validates code → Returns reset token
   */
  async verifyForgotPasswordCode(dto: VerifyForgetDto) {
    // Validate JWT verification token
    let payload;
    try {
      const decodedPayload = this.jwt.decode(dto.resetToken) as any;
      if (!decodedPayload) throw new Error('Invalid token');

      const secret = this.getJwtSecret(
        decodedPayload.userType,
        decodedPayload.role,
      );

      payload = this.jwt.verify(dto.resetToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    // Find user (student or staff)
    let foundUser;
    if (payload.userType === 'student') {
      foundUser = await this.studentService.findStudentById(payload.sub);
    } else {
      foundUser = await this.userService.findById(payload.sub);
    }

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    // Debug logging
    this.logger.log(`Retrieved user: ${foundUser._id}`);
    this.logger.log(`Code hash exists: ${!!foundUser.forgotPasswordCodeHash}`);
    this.logger.log(`Expiry exists: ${!!foundUser.forgotPasswordCodeExpiresAt}`);

    // Validate code exists and hasn't expired
    if (!foundUser.forgotPasswordCodeHash || !foundUser.forgotPasswordCodeExpiresAt) {
      throw new BadRequestException('No verification code found');
    }

    if (foundUser.forgotPasswordCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification code has expired');
    }

    // Check max failed attempts (3)
    if ((foundUser.forgotPasswordFailedAttempts || 0) >= 3) {
      throw new BadRequestException(
        'Too many failed attempts. Request new code.',
      );
    }

    // Verify entered code matches hashed code
    const isCodeValid = await decryptPassword(
      dto.code,
      foundUser.forgotPasswordCodeHash,
    );

    if (!isCodeValid) {
      foundUser.forgotPasswordFailedAttempts =
        (foundUser.forgotPasswordFailedAttempts || 0) + 1;
      await foundUser.save();
      throw new BadRequestException('Invalid verification code');
    }

    // Code valid → Create reset token (15 min validity)
    const resetToken = await this.jwt.signAsync(
      {
        sub: foundUser._id.toString(),
        userType: payload.userType,
        role: payload.userType === 'student' ? 'student' : foundUser.role,
        purpose: 'forgot-password-reset',
      },
      {
        secret: this.getJwtSecret(payload.userType, payload.role),
        expiresIn: '15m',
      },
    );

    this.logger.log(`Code verified for ${payload.userType}`);

    return {
      message: 'Code verified successfully',
      resetToken,
    };
  }

  /**
   * STEP 3: Set new password
   * Validates reset token → Updates password → Sends confirmation
   */
  async setNewPassword(dto: SetForgetPasswordDto) {
    // Validate passwords match
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate reset JWT token
    let payload;
    try {
      const decodedPayload = this.jwt.decode(dto.resetToken) as any;
      if (!decodedPayload) throw new Error('Invalid token');

      const secret = this.getJwtSecret(
        decodedPayload.userType,
        decodedPayload.role,
      );

      payload = this.jwt.verify(dto.resetToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Find user (student or staff)
    let foundUser;
    if (payload.userType === 'student') {
      foundUser = await this.studentService.findStudentById(payload.sub);
    } else {
      foundUser = await this.userService.findById(payload.sub);
    }

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    const hashedPassword = await encryptPassword(dto.newPassword);

    // Update password (calls appropriate service)
    if (payload.userType === 'student') {
      await this.studentService.updateStudentPasswordHash(
        payload.sub,
        hashedPassword,
      );
    } else {
      await this.userService.updatePasswordHash(payload.sub, hashedPassword);
    }

    // Clear temporary fields
    foundUser.forgotPasswordCodeHash = undefined;
    foundUser.forgotPasswordCodeExpiresAt = undefined;
    foundUser.forgotPasswordFailedAttempts = 0;
    await foundUser.save();

    // Send confirmation email
    const html = await this.renderTemplate('password-changed.template.html', {
      fullName: foundUser.fullName,
      staffId: (foundUser as any).staffId || (foundUser as any).eNumber || '',
      loginUrl: `${process.env.APP_URL ?? ''}`,
      supportEmail: 'support@esoft.com',
      year: `${new Date().getFullYear()}`,
    });

    try {
      await this.mailer.sendMail({
        to: foundUser.emailAddress || foundUser.email,
        subject: 'Password Changed Successfully',
        html,
      });
    } catch (emailError) {
      this.logger.error('Confirmation email sending failed', emailError);
      // Continue anyway - password was already updated
    }

    this.logger.log(`Password reset completed for ${payload.userType}`);

    return {
      message: 'Password reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Helper method: Identify user type (student or staff/admin)
   */
  private async identifyUser(
    email: string,
  ): Promise<{ user: any; userType: string }> {
    let foundUser: any = await this.studentService.findByEmail(email);
    let userType = 'student';

    if (!foundUser) {
      foundUser = await this.userService.findByEmail(email);
      userType = 'staff';
    }

    if (!foundUser) {
      throw new BadRequestException('Email not found');
    }

    return { user: foundUser, userType };
  }

  /**
   * Helper method: Render email templates
   */
  private async renderTemplate(
    templateName: string,
    variables: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'email-templates',
      templateName,
    );

    if (!existsSync(templatePath)) {
      throw new BadRequestException(`Template ${templateName} not found`);
    }

    let html = await readFile(templatePath, 'utf-8');

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      html = html.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value));
    });

    return html;
  }

  /**
   * Helper method: Get JWT secret based on user type and role
   */
  private getJwtSecret(userType: string, role: string): string {
    if (userType === 'student') {
      return process.env.STUDENT_JWT_SECRET || 'student-secret';
    }
    if (role === 'admin') {
      return process.env.ADMIN_JWT_SECRET || 'admin-secret';
    }
    return process.env.STAFF_JWT_SECRET || 'staff-secret';
  }
}