import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { loginDto } from './dto/login.dto';
import { decryptPassword } from 'src/utilities/auth/bcrypt.util';
import { rememberme } from './rememberme';
import { JwtPayload, StudentJWTPayload } from './interfaces/jwt-payload.interface';
import { StudentLoginDto } from './dto/student-login.dto';
import { StudentServices } from 'src/users/student.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly studentService: StudentServices,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: loginDto) {
    const user = await this.userService.findByStaffId(dto.staffId);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.role === 'staff' && !user.approved) {
      throw new ForbiddenException('Staff request not approved yet');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await decryptPassword(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isPasswordTemporary) {
      const temporarySessionToken = await this.jwtService.signAsync(
        {
          sub: user._id.toString(),
          purpose: 'temp-password',
        },
        {
          secret: process.env.STAFF_JWT_SECRET,
          expiresIn: '30m',
        },
      );
      return { forcePasswordChange: true, temporarySessionToken };
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      staffId: user.staffId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isPasswordTemporary: user.isPasswordTemporary,
    };

    const { token, expiresIn } = await rememberme(
  this.jwtService,
  payload,
  user.role === 'admin'
    ? (process.env.ADMIN_JWT_SECRET || 'admin-secret')
    : (process.env.STAFF_JWT_SECRET || 'staff-secret'),
  dto.rememberMe,
);

    return {
      tokenType: user.role === 'admin' ? 'adminToken' : 'staffToken',
      token,
      staff: {
        staffId: user.staffId,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        isPasswordTemporary: user.isPasswordTemporary,
      },
    };
  }


  //=================================== Student Login ===================================
  async studentLogin(dto: StudentLoginDto){
    const student = await this.studentService.findByENumber(dto.eNumber);

    if(!student) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await decryptPassword(dto.password, student.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: StudentJWTPayload = {
      sub: student._id.toString(),
      eNumber: student.eNumber,
      fullName: student.fullName,
      email: student.emailAddress,
      role: 'student',
    }

    const {token, expiresIn} = await rememberme(
      this.jwtService,
      payload,
      process.env.STUDENT_JWT_SECRET || 'student-secret',
      dto.rememberMe
    );

    return {
      tokenType: 'studentToken',
      token,
      expiresIn,
      student: {
        _id: student._id,
        eNumber: student.eNumber,
        fullName: student.fullName,
        email: student.emailAddress,
        contactNumber: student.contactNumber,
        dateOfBirth: student.dateOfBirth,
        nic: student.nic,
        address: student.address,
        role: 'student',
      }
    }
  }
}
