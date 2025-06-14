import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
    // Enable CORS with environment-specific origins
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
    : ['http://localhost:3000'];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  console.log(`✅ CORS enabled for origins: ${allowedOrigins.join(', ')}`);

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  console.log('✅ Validation pipe enabled');

  // Initialize Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.$connect();

  // Configure minimal logging
  if (process.env.LOG_LEVEL === 'query') {
    prismaService.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
      return result;
    });
  }

  console.log('✅ Database connection established');

  // Servir archivos estáticos de /uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`
🚀 Server is running on: http://localhost:${port}
📝 API Documentation: http://localhost:${port}/api
⚡ Environment: ${process.env.NODE_ENV || 'development'}
🔐 Authentication endpoints:
   POST http://localhost:${port}/auth/register
   POST http://localhost:${port}/login
  `);
}
bootstrap();