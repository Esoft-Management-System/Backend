import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';


export class loginDto {
  @ApiProperty({ type: String, example: '' })
  @IsNotEmpty({ message: 'Staff Id should not be empty' })
  @IsString()
  staffId: string;

  @ApiProperty({ type: String, example: '' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  password: string;

  @ApiProperty({ type: Boolean, example: false, required: false })
  @IsBoolean()
  rememberMe?: boolean;
}
