import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leavesService.create(createLeaveDto);
  }

  // Endpoint khusus saldo cuti: GET /leaves/balance?employeeId=...&tenantId=...
  @Get('balance')
  getBalance(
    @Query('employeeId') employeeId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.leavesService.getBalance(employeeId, tenantId);
  }

  // Endpoint: GET /leaves?tenantId=123&status=PENDING
  @Get()
  findAll(
    @Query('tenantId') tenantId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    if (tenantId) {
      return this.leavesService.findAllByTenant(tenantId, status);
    }
    if (employeeId) {
      return this.leavesService.findAllByEmployee(employeeId);
    }
    return { error: 'Please provide either tenantId or employeeId query parameter' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leavesService.update(id, updateLeaveDto);
  }

  // Endpoint khusus untuk tombol Approve/Reject di dashboard HR
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('approvedBy') approvedBy: string
  ) {
    return this.leavesService.updateStatus(id, status, approvedBy);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavesService.remove(id);
  }
}
