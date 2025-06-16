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
    // Enable CORS with specific origins for development and production
  const allowedOrigins = [
    'http://localhost:3000',
    'https://xurpia.vercel.app',
    /\.vercel\.app$/
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        return allowedOrigin.test(origin);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  console.log('✅ CORS enabled for multiple origins including Vercel');

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
  await app.listen(port, '0.0.0.0');
  console.log(`
🚀 Server is running on: http://0.0.0.0:${port}
📝 API Documentation: http://0.0.0.0:${port}/api
⚡ Environment: ${process.env.NODE_ENV || 'development'}
🔐 Authentication endpoints:
   POST http://0.0.0.0:${port}/auth/register
   POST http://0.0.0.0:${port}/login
  `);
}
bootstrap();