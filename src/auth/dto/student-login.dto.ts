import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class StudentLoginDto {
  // E-Number
  @ApiProperty({
    type: String,
    example: '',
    description: 'Please enter your student E-Number',
  })
  @IsNotEmpty({
    message: 'E-Number is required',
  })
  @IsString()
  eNumber: string;

  // Password
  @ApiProperty({
    type: String,
    example: '',
    description: 'Please enter your password',
  })
  @IsNotEmpty({
    message: 'Password is required',
  })
  @IsString()
  password: string;

  @ApiProperty({ type: Boolean, example: false, required: false })
  @IsBoolean()
  rememberMe?: boolean;
}
