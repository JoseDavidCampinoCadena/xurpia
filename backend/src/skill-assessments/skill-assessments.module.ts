import { Module } from '@nestjs/common';
import { SkillAssessmentsController } from './skill-assessments.controller';
import { SkillAssessmentsService } from './skill-assessments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkillAssessmentsController],
  providers: [SkillAssessmentsService],
  exports: [SkillAssessmentsService],
})
export class SkillAssessmentsModule {}
