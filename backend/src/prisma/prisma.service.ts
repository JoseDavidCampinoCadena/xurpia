import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    console.log('📦 Initializing Prisma Service');
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('🔌 Prisma Client connected successfully');
      
      // Test the connection by making a simple query
      await this.$queryRaw`SELECT 1`;
      console.log('✨ Database connection verified');
    } catch (error) {
      console.error('❌ Error connecting to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma Client disconnected');
  }
} 