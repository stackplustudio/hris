import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendancesService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    let finalStatus: any = createAttendanceDto.status || 'PRESENT';

    // Auto Keterlambatan (ATT-03): Jika check-in setelah jam 09:15 WIB, status otomatis LATE
    if (createAttendanceDto.checkIn) {
      const checkInDate = new Date(createAttendanceDto.checkIn);
      // Konversi ke zona waktu Indonesia Barat (UTC+7)
      const wibHour = (checkInDate.getUTCHours() + 7) % 24;
      const wibMinute = checkInDate.getUTCMinutes();

      if (wibHour > 9 || (wibHour === 9 && wibMinute > 15)) {
        finalStatus = 'LATE';
      }
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        ...createAttendanceDto,
        status: finalStatus,
        date: new Date(createAttendanceDto.date),
        checkIn: createAttendanceDto.checkIn ? new Date(createAttendanceDto.checkIn) : null,
        checkOut: createAttendanceDto.checkOut ? new Date(createAttendanceDto.checkOut) : null,
      },
    });

    return attendance;
  }

  // Mengambil histori absensi per tenant (untuk dashboard Admin)
  async findAllByTenant(tenantId: string) {
    return this.prisma.attendance.findMany({
      where: { tenantId },
      include: {
        employee: {
          select: { fullName: true, position: true }
        }
      },
      orderBy: { date: 'desc' },
    });
  }

  // Mengambil histori absensi per karyawan (untuk Self-Service Portal)
  async findAllByEmployee(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const dataToUpdate: any = { ...updateAttendanceDto };
    
    // Parsing ulang tanggal jika ada update (misal koreksi manual oleh HR atau check-out)
    if (updateAttendanceDto.date) dataToUpdate.date = new Date(updateAttendanceDto.date);
    if (updateAttendanceDto.checkIn) dataToUpdate.checkIn = new Date(updateAttendanceDto.checkIn);
    if (updateAttendanceDto.checkOut) dataToUpdate.checkOut = new Date(updateAttendanceDto.checkOut);

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: dataToUpdate,
    });

    // Catat Audit Log jika koreksi status dilakukan
    if (updateAttendanceDto.status) {
      try {
        await this.prisma.auditLog.create({
          data: {
            tenantId: updated.tenantId,
            actorId: 'HR Admin',
            action: 'KOREKSI_ABSENSI',
            entity: `Attendance: ID ${id} -> Status ${updateAttendanceDto.status}`,
          },
        });
      } catch (e) {}
    }

    return updated;
  }

  async remove(id: string) {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}
