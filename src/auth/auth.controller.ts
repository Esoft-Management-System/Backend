import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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
}