import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Pastikan Tenant Utama Tersedia
  let tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'stackplus' },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'StackPlus Studio',
        subdomain: 'stackplus',
        plan: 'STARTER',
      },
    });
  }

  // 2. Buat / Update Akun Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stackplus.studio' },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@stackplus.studio',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
    },
  });

  // 3. Pastikan Profil Employee Ada
  const employee = await prisma.employee.findFirst({
    where: { userId: admin.id },
  });

  if (!employee) {
    await prisma.employee.create({
      data: {
        fullName: 'StackPlus Admin',
        position: 'Company Admin',
        employmentStatus: 'ACTIVE',
        joinDate: new Date(),
        tenantId: tenant.id,
        userId: admin.id,
      },
    });
  }

  console.log('✅ Admin seeded with hashed password:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  });