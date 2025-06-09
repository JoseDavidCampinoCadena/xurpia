import { Module } from '@nestjs/common';
import { AiTasksController } from './ai-tasks.controller';
import { AiTasksService } from './ai-tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../AI/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AiTasksController],
  providers: [AiTasksService],
  exports: [AiTasksService]
})
export class AiTasksModule {}
