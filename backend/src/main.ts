import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific origin
  app.enableCors({
    origin: 'http://localhost:3000', // URL de tu frontend (asumiendo que está en el puerto 3000)
    credentials: true,
  });
  console.log('✅ CORS enabled for frontend at http://localhost:3000');

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  console.log('✅ Validation pipe enabled');

  // Initialize Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.$connect();
  console.log('✅ Database connection established');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`
🚀 Server is running on: http://localhost:${port}
📝 API Documentation: http://localhost:${port}/api
⚡ Environment: ${process.env.NODE_ENV || 'development'}
🔐 Authentication endpoints:
   POST http://localhost:${port}/auth/register
   POST http://localhost:${port}/auth/login
  `);
}
bootstrap(); 