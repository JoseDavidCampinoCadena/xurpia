import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AiService } from '../AI/ai.service';
import { AiTasksService } from '../ai-tasks/ai-tasks.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, AiService, AiTasksService],
  exports: [ProjectsService],
})
export class ProjectsModule {}