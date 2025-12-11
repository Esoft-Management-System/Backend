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
import { RequestForgotPasswordDto } from './dto/reset-request.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forget-code.dto';
import { SetNewForgotPasswordDto } from './dto/reset-new-password.dto';

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

  async requestForgotPasswordCode(dto: RequestForgotPasswordDto) {

    const { user: userWrapper, foundUser, userType } = await this.identifyUser(dto.email);      

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    foundUser.forgotPasswordCodeHash = await encryptPassword(code);
    foundUser.forgotPasswordCodeExpiresAt = new Date(
      Date.now() + this.codeExpiryMinutes * 60 * 1000,
    );
    foundUser.forgotPasswordFailedAttempts = 0;
    await foundUser.save();

    const html = await this.renderTemplate('verification-code.template.html', {
      fullName: foundUser.fullName,
      code,
      expiresIn: `${this.codeExpiryMinutes} minutes`,
      supportEmail: 'support@esoft.com',
      year: `${new Date().getFullYear()}`,
    });

    try {
      await this.mailer.sendMail({
        to: foundUser.emailAddress || foundUser.email,
        subject: 'Password Reset Verification Code',
        html,
      });
    } catch (emailError) {
      this.logger.error('Email sending failed, but code was saved', emailError);
    }

    const verificationToken = await this.jwt.signAsync(
      {
        sub: foundUser._id.toString(),
        userType,
        role: userType === 'student' ? 'student' : foundUser.role,
        purpose: 'forgot-password-verification',
      },
      {
        secret: this.getJwtSecret(userType, userType === 'student' ? 'student' : foundUser.role),
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

  async verifyForgotPasswordCode(dto: VerifyForgotPasswordDto) {

    let payload;
    try {
      const decodedPayload = this.jwt.decode(dto.verificationToken) as any;
      if (!decodedPayload) throw new Error('Invalid token');

      const secret = this.getJwtSecret(
        decodedPayload.userType,
        decodedPayload.role,
      );

      payload = this.jwt.verify(dto.verificationToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    let foundUser;
    if (payload.userType === 'student') {
      foundUser = await this.studentService.findStudentById(payload.sub);
    } else {
      foundUser = await this.userService.findById(payload.sub);
    }

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const userData: any = foundUser.toObject ? foundUser.toObject() : foundUser;
    const user: UserData = {
      ...userData,
      email: userData.email || userData.emailAddress,
      role: payload.userType === 'student' ? 'student' : userData.role,
      save: () => foundUser.save(),
    } as UserData;

    if (!user.forgotPasswordCodeHash || !user.forgotPasswordCodeExpiresAt) {
      throw new BadRequestException('No verification code found');
    }

    if (user.forgotPasswordCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification code has expired');
    }

    if ((user.forgotPasswordFailedAttempts || 0) >= 3) {
      throw new BadRequestException(
        'Too many failed attempts. Request new code.',
      );
    }

    const isCodeValid = await decryptPassword(
      dto.verificationCode,
      user.forgotPasswordCodeHash,
    );

    if (!isCodeValid) {
      user.forgotPasswordFailedAttempts =
        (user.forgotPasswordFailedAttempts || 0) + 1;
      await user.save();
      throw new BadRequestException('Invalid verification code');
    }

    const resetToken = await this.jwt.signAsync(
      {
        sub: user._id.toString(),
        userType: payload.userType,
        role: user.role,
        purpose: 'forgot-password-reset',
      },
      {
        secret: this.getJwtSecret(payload.userType, user.role),
        expiresIn: '15m',
      },
    );

    this.logger.log(`Code verified for ${payload.userType}`);

    return {
      message: 'Code verified successfully',
      resetToken,
    };
  }

  async setNewPassword(dto: SetNewForgotPasswordDto) {

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

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

    let foundUser;
    if (payload.userType === 'student') {
      foundUser = await this.studentService.findStudentById(payload.sub);
    } else {
      foundUser = await this.userService.findById(payload.sub);
    }

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const userData: any = foundUser.toObject ? foundUser.toObject() : foundUser;
    const user: UserData = {
      ...userData,
      email: userData.email || userData.emailAddress,
      role: payload.userType === 'student' ? 'student' : userData.role,
      save: () => foundUser.save(),
    } as UserData;

    const hashedPassword = await encryptPassword(dto.newPassword);

    if (payload.userType === 'student') {
      await this.studentService.updateStudentPasswordHash(
        payload.sub,
        hashedPassword,
      );
    } else {
      await this.userService.updatePasswordHash(payload.sub, hashedPassword);
    }

    user.forgotPasswordCodeHash = undefined;
    user.forgotPasswordCodeExpiresAt = undefined;
    user.forgotPasswordFailedAttempts = 0;
    await user.save();

    const html = await this.renderTemplate('password-changed.template.html', {
      fullName: user.fullName,
      staffId: (user as any).staffId || (user as any).eNumber || '',
      loginUrl: `${process.env.APP_URL ?? ''}`,
      supportEmail: 'support@esoft.com',
      Year: `${new Date().getFullYear()}`,
    });

    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Password Changed Successfully',
        html,
      });
    } catch (emailError) {
      this.logger.error('Confirmation email sending failed', emailError);
    }

    this.logger.log(`Password reset completed for ${payload.userType}`);

    return {
      message:
        'Password reset successfully. Please log in with your new password.',
    };
  }

  private async identifyUser(identifier: string): Promise<{
    user: UserData;
    foundUser: any;
    userType: 'student' | 'staff';
  }> {

    let foundUser: any = await this.studentService.findByEmail(identifier);
    let userType: 'student' | 'staff' = 'student';

    if (!foundUser) {
      foundUser = await this.userService.findByEmail(identifier);
      userType = 'staff';
    }

    if (!foundUser) {
      throw new BadRequestException('Email not found');
    }

    const userData = foundUser.toObject ? foundUser.toObject() : foundUser;
    const user: UserData = {
      ...userData,
      _id: userData._id.toString(),
      email: userData.emailAddress || userData.email, 
      fullName: userData.fullName,
      forgotPasswordCodeHash: userData.forgotPasswordCodeHash,
      forgotPasswordCodeExpiresAt: userData.forgotPasswordCodeExpiresAt,
      forgotPasswordFailedAttempts: userData.forgotPasswordFailedAttempts || 0,
      role: userType === 'student' ? 'student' : (userData.role || 'staff'),
      save: foundUser.save.bind(foundUser),
    } as UserData;

    return { user, foundUser, userType };
  }

  private getJwtSecret(userType: 'student' | 'staff', role?: string): string {
    if (userType === 'student') {
      return process.env.STUDENT_JWT_SECRET_KEY || 'student-secret';
    }

    if (role === 'admin') {
      return process.env.ADMIN_JWT_SECRET || 'admin-secret';
    }

    return process.env.STAFF_JWT_SECRET || 'staff-secret';
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
}
