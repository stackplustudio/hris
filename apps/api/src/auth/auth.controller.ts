import { Controller, Post, Body, UnauthorizedException, Res, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard'; 
import { PrismaService } from '../prisma/prisma.service'; 

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService
  ) {}

  // POST /auth/login
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Email atau Password salah');
    }

    const tokens = await this.authService.login(user);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return {
      message: 'Login berhasil',
      user: tokens.user,
      access_token: tokens.access_token,
    };
  }

  // POST /auth/register — AUTH-01: Self-serve Tenant Onboarding
  @Post('register')
  async register(
    @Body() body: {
      companyName: string;
      subdomain: string;
      adminEmail: string;
      adminPassword: string;
    }
  ) {
    return this.authService.registerTenant(body);
  }

  // PATCH /auth/reset-password — AUTH-05: Reset Password (tanpa email service)
  @Patch('reset-password')
  async resetPassword(
    @Body() body: { email: string; newPassword: string }
  ) {
    return this.authService.resetPassword(body);
  }

  // GET /auth/profile — Digunakan oleh hook useAuth di Frontend
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const targetId = req.user.userId || req.user.sub || req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
      include: {
        employee: {
          include: { tenant: true }
        }
      }
    });

    return {
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      employee: user?.employee ? { id: user.employee.id, fullName: user.employee.fullName } : null,
      tenant: user?.employee?.tenant ? { id: user.employee.tenant.id, name: user.employee.tenant.name } : null,
    };
  }

  // POST /auth/logout — Hapus refresh token cookie
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { message: 'Logout berhasil' };
  }
}
