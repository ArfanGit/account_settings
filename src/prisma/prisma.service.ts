import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    // Temporary debug log for deployment diagnosis
    // eslint-disable-next-line no-console
    console.log('PrismaService DATABASE_URL:', dbUrl);

    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
