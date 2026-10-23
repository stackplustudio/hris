import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto) {
    const newLeave = await this.prisma.leaveRequest.create({
      data: {
        ...createLeaveDto,
        startDate: new Date(createLeaveDto.startDate),
        endDate: new Date(createLeaveDto.endDate),
      },
    });

    // Catat ke Audit Log
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: createLeaveDto.tenantId,
          actorId: createLeaveDto.employeeId,
          action: 'AJUKAN_CUTI',
          entity: `LeaveRequest: ${createLeaveDto.leaveType}`,
        },
      });
    } catch (e) {
      // Abaikan jika audit log gagal agar transaksi utama tetap jalan
    }

    return newLeave;
  }

  // Mengambil daftar cuti untuk HR/Admin (bisa difilter berdasarkan status PENDING)
  async findAllByTenant(tenantId: string, status?: string) {
    const whereClause: any = { tenantId };
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { fullName: true, department: { select: { name: true } } }
        }
      },
      orderBy: { startDate: 'desc' },
    });
  }

  // Mengambil riwayat pengajuan cuti untuk satu karyawan
  async findAllByEmployee(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    const dataToUpdate: any = { ...updateLeaveDto };
    
    if (updateLeaveDto.startDate) dataToUpdate.startDate = new Date(updateLeaveDto.startDate);
    if (updateLeaveDto.endDate) dataToUpdate.endDate = new Date(updateLeaveDto.endDate);

    return this.prisma.leaveRequest.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // Fungsi khusus untuk HR menyetujui/menolak cuti sekaligus sinkronisasi saldo cuti
  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) {
    const existingLeave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!existingLeave) throw new NotFoundException('Data permohonan cuti tidak ditemukan');

    // Jika disetujui (APPROVED) dan sebelumnya belum disetujui, potong saldo cuti
    if (status === 'APPROVED' && existingLeave.status !== 'APPROVED') {
      const start = new Date(existingLeave.startDate).getTime();
      const end = new Date(existingLeave.endDate).getTime();
      const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

      const currentYear = new Date(existingLeave.startDate).getFullYear();
      let balanceRecord = await this.prisma.leaveBalance.findFirst({
        where: {
          employeeId: existingLeave.employeeId,
          year: currentYear,
        },
      });

      if (!balanceRecord) {
        await this.prisma.leaveBalance.create({
          data: {
            tenantId: existingLeave.tenantId,
            employeeId: existingLeave.employeeId,
            leaveType: existingLeave.leaveType,
            year: currentYear,
            balance: Math.max(0, 12 - diffDays),
          },
        });
      } else {
        await this.prisma.leaveBalance.update({
          where: { id: balanceRecord.id },
          data: {
            balance: Math.max(0, balanceRecord.balance - diffDays),
          },
        });
      }
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { 
        status,
        approvedBy 
      },
    });

    // Catat Audit Log persetujuan
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: existingLeave.tenantId,
          actorId: approvedBy || 'Admin',
          action: status === 'APPROVED' ? 'SETUJUI_CUTI' : 'TOLAK_CUTI',
          entity: `LeaveRequest: ID ${id}`,
        },
      });
    } catch (e) {}

    return updated;
  }

  // Mengambil saldo cuti aktual karyawan untuk tahun berjalan
  async getBalance(employeeId: string, tenantId: string) {
    const currentYear = new Date().getFullYear();
    let balanceRecord = await this.prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        year: currentYear,
      },
    });

    if (!balanceRecord) {
      balanceRecord = await this.prisma.leaveBalance.create({
        data: {
          tenantId,
          employeeId,
          leaveType: 'Cuti Tahunan',
          year: currentYear,
          balance: 12,
        },
      });
    }

    return balanceRecord;
  }

  async remove(id: string) {
    return this.prisma.leaveRequest.delete({
      where: { id },
    });
  }
}
