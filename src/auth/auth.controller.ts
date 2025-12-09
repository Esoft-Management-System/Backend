import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { StudentLoginDto } from './dto/student-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('staff-login')
  @ApiOperation({ summary: 'Staff/Admin login with staffId + password' })
  @ApiOkResponse({
    description: 'Successful login or temporary-password flow trigger',
    schema: {
      oneOf: [
        {
          example: {
            tokenType: 'staffToken',
            token: '<jwt>',
            staff: {
              staffId: 'STF001',
              fullName: 'Jane Doe',
              email: 'jane@example.com',
              role: 'staff',
              isPasswordTemporary: false,
            },
          },
        },
        {
          example: {
            forcePasswordChange: true,
            temporarySessionToken: '<jwt>',
          },
        },
      ],
    },
  })
  login(@Body() dto: loginDto) {
    return this.authService.login(dto);
  }

  @Post('student-login')
  @ApiOperation({ summary: 'Student login with E-Number + password' })
  @ApiOkResponse({
    description: 'Successful student login',
    example: {
      tokenType: 'studentToken',
      token: '<jwt>',
      student: {
        _id: 'urnjjueoejncjckrurpepjdhsj',
        eNumber: 'EN001',
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        contactNumber: '+1234567890',
        dateOfBirth: '2000-07-03',
        nic: '200018503118',
        address: '123 Main St, Cityville',
        role: 'student',
      },
    },
  })
  studentLogin(@Body() dto: StudentLoginDto) {
    return this.authService.studentLogin(dto);
  }
}
