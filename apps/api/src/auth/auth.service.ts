import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Validasi kredensial (Email & Password)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    
    return null;
  }

  // 2. Generate Tokens (Access & Refresh)
  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-cahyodev',
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      access_token: accessToken,
      refreshToken,
    };
  }

  // 3. AUTH-01 — Register Tenant Baru (Self-serve Onboarding)
  async registerTenant(data: {
    companyName: string;
    subdomain: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    const { companyName, subdomain, adminEmail, adminPassword } = data;

    // Normalisasi subdomain: lowercase, hanya huruf/angka/strip
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Cek apakah subdomain sudah dipakai
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: cleanSubdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Subdomain sudah digunakan perusahaan lain. Silakan pilih subdomain lain.');
    }

    // Cek apakah email admin sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    return this.prisma.$transaction(async (tx: any) => {
      // Buat Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          subdomain: cleanSubdomain,
          plan: 'STARTER',
        },
      });

      // Buat User COMPANY_ADMIN
      const user = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'COMPANY_ADMIN',
          tenantId: tenant.id,
        },
      });

      // Buat profil Employee untuk admin
      await tx.employee.create({
        data: {
          fullName: companyName + ' Admin',
          position: 'Company Admin',
          tenantId: tenant.id,
          userId: user.id,
          joinDate: new Date(),
          employmentStatus: 'ACTIVE',
        },
      });

      return {
        message: 'Akun perusahaan berhasil dibuat! Silakan login.',
        tenantId: tenant.id,
        subdomain: cleanSubdomain,
      };
    });
  }

  // 4. AUTH-05 — Reset Password (Admin-assisted, tanpa email service)
  async resetPassword(data: { email: string; newPassword: string }) {
    const { email, newPassword } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'Jika email terdaftar, password telah diperbarui.' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    return { message: 'Password berhasil diperbarui. Silakan login dengan password baru.' };
  }
}
