import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { StaffRequestService } from './staff-request.service';
import { StaffRequest } from './schemas/staff-request.schema';
import { CreateStaffRequestDto } from './dto/create-staff-request.dto';


@ApiTags('Staff Requests')
@Controller('staff-requests')
export class StaffRequestController {
  constructor(private readonly svc: StaffRequestService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a staff request login' })
  @ApiResponse({
    status: 201,
    description: 'Request send successfully',
    type: StaffRequest,
  })
  @ApiBadRequestResponse({
    description: 'Validation error or duplication request',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateStaffRequestDto) {
    const created = await this.svc.create(dto);
    return {
      message: 'Request sent',
      detail:
        'Your login request was sent successfully. The team will contact you via email.',
      data: created,
    };
  }

  //================================= Get all staff Requests Controller ====================================
  @Get()
  @ApiOperation({ summary: 'List all staff requests' })
  @ApiResponse({
    status: 200,
    description: 'List of staff requests',
    type: [StaffRequest],
  })
  async findAll() {
    const items = await this.svc.findAll();
    return { count: items.length, items };
  }

  @Get('admin/summary')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin view: categorized staff requests' })
  @ApiResponse({ status: 200, description: 'Categorized staff requests' })
  async getAdminSummary() {
    return this.svc.findAdminSummary();
  }

  //================================= Approve staff Request ====================================
  @Patch(':id/approve')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve a staff request (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Request approved',
    type: StaffRequest,
  })
  @ApiNotFoundResponse({ description: 'Request not found' })
  async approve(@Param('id') id: string) {
    const updated = await this.svc.approve(id);
    return {
      message: 'Request approved',
      data: updated,
    };
  }

  @Patch(':id/reapprove')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reapprove an expired temporary password (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Temporary password reissued',
    type: StaffRequest,
  })
  @ApiNotFoundResponse({ description: 'Request not found' })
  async reapprove(@Param('id') id: string) {
    const updated = await this.svc.reapprove(id);
    return {
      message: 'Temporary password reissued',
      data: updated,
    };
  }
  //================================= Reject staff Request Controller ====================================
  @Patch(':id/reject')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reject a staff request' })
  @ApiResponse({
    status: 200,
    description: 'Request rejected',
    type: StaffRequest,
  })
  @ApiNotFoundResponse({ description: 'Request not found' })
  async reject(@Param('id') id: string) {
    const updated = await this.svc.rejectStaffRequest(id);
    return {
      message: 'Request rejected',
      data: updated,
    };
  }
}
