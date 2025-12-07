import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { loginDto } from './dto/login.dto';
import { decryptPassword } from 'src/utilities/auth/bcrypt.util';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: loginDto) {
    const user = await this.userService.findByStaffId(dto.staffId);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.role !== 'staff' && !user.approved) {
      throw new ForbiddenException('Staff request not approved yet');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await decryptPassword(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      staffId: user.staffId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isPasswordTemporary: user.isTemporaryPassword,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret:
        user.role === 'admin'
          ? process.env.ADMIN_JWT_SECRET
          : process.env.STAFF_JWT_SECRET,
      expiresIn: '1d',
    });

    return {
      tokenType: user.role === 'admin' ? 'adminToken' : 'staffToken',
      token,
      staff: {
        staffId: user.staffId,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        isPasswordTemporary: user.isTemporaryPassword,
      },
    };
  }
}
