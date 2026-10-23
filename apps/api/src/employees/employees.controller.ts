import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  // EMP-06: Endpoint Bulk Import Karyawan
  @Post('bulk')
  createBulk(
    @Body() body: { tenantId: string; employees: CreateEmployeeDto[] }
  ) {
    return this.employeesService.createBulk(body.tenantId, body.employees);
  }

  // Endpoint: GET /employees?tenantId=xxxx
  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      return { error: 'tenantId query parameter is required' };
    }
    return this.employeesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
