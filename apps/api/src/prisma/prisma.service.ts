import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@cahyodev/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    let retries = 3;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Terhubung ke database Neon PostgreSQL');
        return;
      } catch (err: any) {
        retries -= 1;
        this.logger.warn(
          `⚠️ Database Neon sedang bangun (cold start) atau koneksi tertunda: ${err.message}. Mencoba lagi (${retries} kesempatan tersisa)...`
        );
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
        } else {
          this.logger.error('❌ Gagal menyambung ke database saat inisialisasi awal. Koneksi akan dicoba lagi otomatis saat ada request pertama.');
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
