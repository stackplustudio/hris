import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const hashedPassword = await bcrypt.hash(createEmployeeDto.password || 'Stackplus123!', 10);

      return await this.prisma.$transaction(async (tx: any) => {
        // 1. Buat Akun Log-in (User)
        const newUser = await tx.user.create({
          data: {
            email: createEmployeeDto.email,
            password: hashedPassword,
            role: 'EMPLOYEE',
            tenantId: createEmployeeDto.tenantId,
          },
        });

        // 2. Buat Profil Karyawan (Employee)
        const employee = await tx.employee.create({
          data: {
            fullName: createEmployeeDto.fullName,
            position: createEmployeeDto.position,
            employmentStatus: createEmployeeDto.employmentStatus || 'ACTIVE',
            tenantId: createEmployeeDto.tenantId,
            departmentId: createEmployeeDto.departmentId || null,
            managerId: createEmployeeDto.managerId || null,
            joinDate: createEmployeeDto.joinDate ? new Date(createEmployeeDto.joinDate) : new Date(),
            userId: newUser.id,
          },
        });

        // 3. Inisialisasi Saldo Cuti Tahunan Otomatis (LEV-03)
        await tx.leaveBalance.create({
          data: {
            tenantId: createEmployeeDto.tenantId,
            employeeId: employee.id,
            leaveType: 'Cuti Tahunan',
            balance: 12,
            year: new Date().getFullYear(),
          },
        });

        // 4. Catat Log Audit (AUTH-07)
        try {
          await tx.auditLog.create({
            data: {
              tenantId: createEmployeeDto.tenantId,
              actorId: 'Admin HR',
              action: 'TAMBAH_KARYAWAN',
              entity: `Employee: ${createEmployeeDto.fullName} (${createEmployeeDto.position})`,
            },
          });
        } catch (e) {}

        return employee;
      });
    } catch (error: any) {
      throw new InternalServerErrorException('Gagal membuat karyawan: ' + error.message);
    }
  }

  // EMP-06: Bulk Create Karyawan dari CSV/Excel
  async createBulk(tenantId: string, employees: CreateEmployeeDto[]) {
    const results = [];
    for (const emp of employees) {
      try {
        const created = await this.create({ ...emp, tenantId });
        results.push({ success: true, name: emp.fullName, data: created });
      } catch (err: any) {
        results.push({ success: false, name: emp.fullName, error: err.message });
      }
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          actorId: 'Admin HR',
          action: 'IMPORT_KARYAWAN_MASSAL',
          entity: `Import Massal: ${results.filter(r => r.success).length}/${employees.length} karyawan berhasil diimpor`,
        },
      });
    } catch (e) {}

    return results;
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId },
      include: {
        department: true,
        user: { select: { email: true, role: true } }, 
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: { department: true, manager: true, user: { select: { email: true } } },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const dataToUpdate: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.joinDate) {
      dataToUpdate.joinDate = new Date(updateEmployeeDto.joinDate);
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: dataToUpdate,
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: updated.tenantId,
          actorId: 'Admin HR',
          action: 'UPDATE_KARYAWAN',
          entity: `Employee: ${updated.fullName}`,
        },
      });
    } catch (e) {}

    return updated;
  }

  async remove(id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) return null;

    // Hapus User terkait (relasi onDelete Cascade di Employee -> User jika dihapus)
    const deleted = await this.prisma.employee.delete({
      where: { id },
    });

    if (emp.userId) {
      try {
        await this.prisma.user.delete({ where: { id: emp.userId } });
      } catch (e) {}
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: emp.tenantId,
          actorId: 'Admin HR',
          action: 'HAPUS_KARYAWAN',
          entity: `Employee: ${emp.fullName}`,
        },
      });
    } catch (e) {}

    return deleted;
  }
}
