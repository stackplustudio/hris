import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ambil metrik dasar
    const totalEmployees = await this.prisma.employee.count({ where: { tenantId } });
    const pendingLeaves = await this.prisma.leaveRequest.count({
      where: {
        tenantId,
        status: 'PENDING',
      },
    });
    const todayAttendances = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        date: {
          gte: today,
        },
      },
    });

    // Ambil 6 aktivitas terbaru (Audit Log - AUTH-07)
    const recentAuditLogs = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { timestamp: 'desc' },
      take: 6,
    });

    return {
      totalEmployees,
      pendingLeaves,
      present: todayAttendances.filter((a: any) => a.status === 'PRESENT').length,
      late: todayAttendances.filter((a: any) => a.status === 'LATE').length,
      absent: todayAttendances.filter((a: any) => a.status === 'ABSENT').length,
      recentAuditLogs,
    };
  }
}
