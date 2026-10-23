import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  // Untuk HRD melihat semua KPI
  async findAll(tenantId: string) {
    return this.prisma.performanceGoal.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Untuk Karyawan melihat KPI miliknya sendiri
  async findMyGoals(userIdOrEmployeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { id: userIdOrEmployeeId },
          { userId: userIdOrEmployeeId },
        ],
      },
    });

    if (!employee) return [];

    return this.prisma.performanceGoal.findMany({
      where: { employeeId: employee.id },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // HRD membuat/menetapkan target KPI baru
  async createGoal(data: { tenantId: string; employeeId: string; period: string; objective: string }) {
    return this.prisma.performanceGoal.create({
      data: {
        tenantId: data.tenantId,
        employeeId: data.employeeId,
        period: data.period,
        objective: data.objective,
        score: 0,
        status: 'ON_PROGRESS',
      },
      include: { employee: true },
    });
  }

  // HRD menilai skor KPI
  async updateScore(id: string, score: number) {
    let status = 'POOR';
    if (score >= 90) status = 'EXCELLENT';
    else if (score >= 75) status = 'GOOD';
    else if (score >= 60) status = 'AVERAGE';

    return this.prisma.performanceGoal.update({
      where: { id },
      data: { score, status },
      include: { employee: true },
    });
  }
}
