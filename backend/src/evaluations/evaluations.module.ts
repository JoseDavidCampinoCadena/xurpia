import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../AI/ai.service';

@Module({
  controllers: [EvaluationsController],
  providers: [EvaluationsService, PrismaService, AiService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
