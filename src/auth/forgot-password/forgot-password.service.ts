import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
import { UserService } from 'src/users/users.service';
import { StudentServices } from 'src/users/student.service';
import { RequestForgotPasswordDto } from './dto/request-forgot-password.dto';
import { ResendForgotPasswordDto } from './dto/resend-forgot-password.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot.password.dto';
import { SetNewForgotPasswordDto } from './dto/set-new-forgot-password.dto';
import { decryptPassword, encryptPassword } from 'src/utilities/auth/bcrypt.util';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';

type Role = 'student' | 'staff';

@Injectable()
export class ForgotPasswordService {
	private readonly logger = new Logger(ForgotPasswordService.name);
	private readonly expiryMinutes = 10;
	private readonly maxAttempts = 5;

	constructor(
		private readonly jwt: JwtService,
		private readonly mailer: MailerService,
		private readonly userService: UserService,
		private readonly studentService: StudentServices,
	) {}

	async requestCode(dto: RequestForgotPasswordDto) {
		const { userDoc, role } = await this.findUserByEmail(dto.email, dto.role);
		const code = this.generateCode();

		userDoc.forgotPasswordCodeHash = await encryptPassword(code);
		userDoc.forgotPasswordCodeExpiresAt = new Date(
			Date.now() + this.expiryMinutes * 60 * 1000,
		);
		userDoc.forgotPasswordFailedAttempts = 0;
		await userDoc.save();

		const sessionToken = await this.signSessionToken(userDoc.id, role);
		await this.sendCodeEmail(userDoc, code, role);

		return {
			message: 'Verification code sent to your email',
			forgotSessionToken: sessionToken,
			expiresInSeconds: this.expiryMinutes * 60,
		};
	}

	async resendCode(dto: ResendForgotPasswordDto) {
		const payload = this.verifySessionToken(dto.forgotSessionToken);
		const { userDoc } = await this.findUserById(payload.sub, payload.role as Role);
		const code = this.generateCode();

		userDoc.forgotPasswordCodeHash = await encryptPassword(code);
		userDoc.forgotPasswordCodeExpiresAt = new Date(
			Date.now() + this.expiryMinutes * 60 * 1000,
		);
		userDoc.forgotPasswordFailedAttempts = 0;
		await userDoc.save();

		await this.sendCodeEmail(userDoc, code, payload.role as Role);

		return {
			message: 'Verification code resent to your email',
			expiresInSeconds: this.expiryMinutes * 60,
		};
	}

	async verifyCode(dto: VerifyForgotPasswordDto) {
		const payload = this.verifySessionToken(dto.forgotSessionToken);
		const { userDoc } = await this.findUserById(payload.sub, payload.role as Role);
		await this.assertCodeValid(userDoc, dto.verificationCode);

		const resetToken = await this.signResetToken(userDoc.id, payload.role as Role);
		return { message: 'Code verified successfully', resetToken };
	}

	async resetPassword(dto: SetNewForgotPasswordDto) {
		if (dto.newPassword !== dto.confirmNewPassword) {
			throw new BadRequestException('Passwords do not match');
		}

		const payload = this.verifyResetToken(dto.resetToken);
		const { userDoc, role } = await this.findUserById(
			payload.sub,
			payload.role as Role,
		);

		const hashed = await encryptPassword(dto.newPassword);
		if (role === 'student') {
			await this.studentService.updateStudentPasswordHash(userDoc.id, hashed);
		} else {
			await this.userService.updatePasswordHash(userDoc.id, hashed);
		}

		userDoc.forgotPasswordCodeHash = undefined;
		userDoc.forgotPasswordCodeExpiresAt = undefined;
		userDoc.forgotPasswordFailedAttempts = 0;
		await userDoc.save();

		await this.sendPasswordChangedEmail(userDoc, role);

		return { message: 'Password reset successfully' };
	}

	// ========================= helpers =========================

	private async findUserByEmail(email: string, role: Role) {
		const normalizedRole: Role = role === 'student' ? 'student' : 'staff';
		const userDoc =
			normalizedRole === 'student'
				? await this.studentService.findByEmail(email)
				: await this.userService.findByEmail(email);

		if (!userDoc) {
			throw new NotFoundException('Account not found');
		}

		return { userDoc, role: normalizedRole };
	}

	private async findUserById(id: string, role: Role) {
		const normalizedRole: Role = role === 'student' ? 'student' : 'staff';
		const userDoc =
			normalizedRole === 'student'
				? await this.studentService.findStudentById(id)
				: await this.userService.findById(id);

		if (!userDoc) {
			throw new NotFoundException('Account not found');
		}

		return { userDoc, role: normalizedRole };
	}

	private async assertCodeValid(user: any, code: string) {
		if (!user.forgotPasswordCodeHash || !user.forgotPasswordCodeExpiresAt) {
			throw new BadRequestException('No verification code found');
		}

		if (user.forgotPasswordCodeExpiresAt.getTime() < Date.now()) {
			throw new BadRequestException('Verification code expired');
		}

		if ((user.forgotPasswordFailedAttempts ?? 0) >= this.maxAttempts) {
			throw new BadRequestException('Too many attempts. Please resend code.');
		}

		const isValid = await decryptPassword(code, user.forgotPasswordCodeHash);
		if (!isValid) {
			user.forgotPasswordFailedAttempts =
				(user.forgotPasswordFailedAttempts ?? 0) + 1;
			await user.save();
			throw new BadRequestException('Invalid verification code');
		}

		// reset attempts on success
		user.forgotPasswordFailedAttempts = 0;
		await user.save();
	}

	private generateCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	private getUserEmail(user: any): string {
		return user.emailAddress || user.email;
	}

	private getJwtSecret(role: Role): string {
		if (role === 'student') return process.env.STUDENT_JWT_SECRET_KEY || 'student-secret';
		return process.env.STAFF_JWT_SECRET || 'staff-secret';
	}

	private async signSessionToken(userId: string, role: Role) {
		return this.jwt.signAsync(
			{ sub: userId, role, purpose: 'forgot-password-session' },
			{ secret: this.getJwtSecret(role), expiresIn: '15m' },
		);
	}

	private async signResetToken(userId: string, role: Role) {
		return this.jwt.signAsync(
			{ sub: userId, role, purpose: 'forgot-password-reset' },
			{ secret: this.getJwtSecret(role), expiresIn: '15m' },
		);
	}

	private verifySessionToken(token: string) {
		try {
			const decoded: any = this.jwt.decode(token);
			if (!decoded?.role) throw new Error('bad token');
			const secret = this.getJwtSecret(decoded.role as Role);
			const payload = this.jwt.verify(token, { secret });
			if (payload.purpose !== 'forgot-password-session') throw new Error('bad purpose');
			return payload as { sub: string; role: Role };
		} catch {
			throw new UnauthorizedException('Invalid or expired session token');
		}
	}

	private verifyResetToken(token: string) {
		try {
			const decoded: any = this.jwt.decode(token);
			if (!decoded?.role) throw new Error('bad token');
			const secret = this.getJwtSecret(decoded.role as Role);
			const payload = this.jwt.verify(token, { secret });
			if (payload.purpose !== 'forgot-password-reset') throw new Error('bad purpose');
			return payload as { sub: string; role: Role };
		} catch {
			throw new UnauthorizedException('Invalid or expired reset token');
		}
	}

	private resolveTemplatePath(fileName: string): string {
		const distPath = path.join(process.cwd(), 'dist', 'email-templates', fileName);
		if (existsSync(distPath)) return distPath;
		return path.join(process.cwd(), 'src', 'email-templates', fileName);
	}

	private async renderTemplate(fileName: string, variables: Record<string, string>): Promise<string> {
		const templatePath = this.resolveTemplatePath(fileName);
		const content = await readFile(templatePath, 'utf-8');
		return Object.entries(variables).reduce((acc, [key, value]) => {
			const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
			return acc.replace(pattern, value ?? '');
		}, content);
	}

	private async sendCodeEmail(user: any, code: string, role: Role) {
		const html = await this.renderTemplate('verification-code.template.html', {
			fullName: user.fullName ?? '',
			code,
			expiresIn: `${this.expiryMinutes} minutes`,
			supportEmail: 'support@esoft.com',
			year: `${new Date().getFullYear()}`,
		});
		await this.safeSendEmail(this.getUserEmail(user), 'Password Reset Code', html);
	}

	private async sendPasswordChangedEmail(user: any, role: Role) {
		const html = await this.renderTemplate('password-changed.template.html', {
			fullName: user.fullName ?? '',
			staffId: user.staffId ?? user.eNumber ?? '',
			loginUrl: `${process.env.APP_URL ?? ''}`,
			supportEmail: 'support@esoft.com',
			year: `${new Date().getFullYear()}`,
		});
		try {
			await this.mailer.sendMail({
				to: this.getUserEmail(user),
				subject: 'Password changed successfully',
				html,
			});
		} catch (err) {
			this.logger.error('Failed to send password changed email', err as any);
		}
	}

	private async safeSendEmail(email: string, subject: string, html: string) {
		try {
			await this.mailer.sendMail({
				to: email,
				subject,
				html,
			});
		} catch (err) {
			this.logger.error('Failed to send email', err as any);
		}
	}
}
