import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.payroll.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyPayslips(userIdOrEmployeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { id: userIdOrEmployeeId },
          { userId: userIdOrEmployeeId },
        ],
      },
    });

    if (!employee) return [];

    return this.prisma.payroll.findMany({
      where: { employeeId: employee.id },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateMonthly(tenantId: string, period: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, employmentStatus: 'ACTIVE' },
    });

    let generatedCount = 0;

    for (const emp of employees) {
      const existing = await this.prisma.payroll.findUnique({
        where: { employeeId_period: { employeeId: emp.id, period } },
      });

      if (!existing) {
        const pos = emp.position.toLowerCase();
        const basic = pos.includes('lead') || pos.includes('manager')
          ? 15000000
          : pos.includes('developer') || pos.includes('engineer')
          ? 12000000
          : 8000000;
        const allow = 1000000;
        const deduct = 0;

        await this.prisma.payroll.create({
          data: {
            tenantId,
            employeeId: emp.id,
            period,
            basicSalary: basic,
            allowance: allow,
            deduction: deduct,
            netSalary: basic + allow - deduct,
            status: 'PAID',
          },
        });
        generatedCount++;
      }
    }

    // Catat Audit Log (AUTH-07)
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          actorId: 'Admin Finance/HR',
          action: 'GENERATE_PAYROLL',
          entity: `Payroll: ${generatedCount} slip gaji periode ${period}`,
        },
      });
    } catch (e) {}

    return { message: `Berhasil generate ${generatedCount} slip gaji baru untuk periode ${period}` };
  }
}
