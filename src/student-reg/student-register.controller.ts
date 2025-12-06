import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentRegService } from './student-reg.service';
import { StudentRegistration } from './Schemas/student-reg.schema';
import { StudentRegDto } from './dto/student-reg.dto';

@ApiTags('Student Registration')
@Controller('student-reg')
export class StudentRegController {
  constructor(private readonly studentRegService: StudentRegService) {}

  //================================= Create Student Registration ====================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new student' })
  @ApiResponse({
    status: 201,
    description: 'Student registered successfully.',
    type: StudentRegistration,
  })
  @ApiBadRequestResponse({
    description: 'Validation error or duplicate registration.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: StudentRegDto) {
    const created = await this.studentRegService.create(dto);
    return { message: 'Student registered successfully.', data: created };
  }

  //================================= Get All Students ====================================
  @Get()
  @ApiOperation({ summary: 'Get all registered students' })
  @ApiResponse({
    status: 200,
    description: 'List of all students.',
    type: [StudentRegistration],
  })
  async findAll() {
    const students = await this.studentRegService.findAll();
    return { count: students.length, data: students };
  }

  //================================= Get Student By ID ====================================
  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({
    status: 200,
    description: 'Student details.',
    type: StudentRegistration,
  })
  @ApiNotFoundResponse({ description: 'Student not found.' })
  async findOne(@Param('id') id: string) {
    const student = await this.studentRegService.findOne(id);
    return { data: student };
  }

  //================================= Get Student By E-Number ====================================
  @Get('e-number/:eNumber')
  @ApiOperation({ summary: 'Get student by E-Number' })
  @ApiResponse({
    status: 200,
    description: 'Student details.',
    type: StudentRegistration,
  })
  @ApiNotFoundResponse({ description: 'Student not found.' })
  async findByENumber(@Param('eNumber') eNumber: string) {
    const student = await this.studentRegService.findByENumber(eNumber);
    return { data: student };
  }

  //================================= Delete Student ====================================
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Student not found.' })
  async delete(@Param('id') id: string) {
    await this.studentRegService.delete(id);
    return { message: 'Student deleted successfully.' };
  }
}
