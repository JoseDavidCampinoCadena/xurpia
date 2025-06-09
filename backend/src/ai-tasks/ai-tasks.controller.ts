import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AiTasksService } from './ai-tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-tasks')
@UseGuards(JwtAuthGuard)
export class AiTasksController {
  constructor(private readonly aiTasksService: AiTasksService) {}
  @Get()
  async getAiTasks(
    @Request() req,
    @Query('projectId') projectId?: string,
    @Query('assignedOnly') assignedOnly?: string
  ) {
    const projectIdNum = projectId ? parseInt(projectId) : undefined;
    const isAssignedOnly = assignedOnly === 'true';
    
    return this.aiTasksService.getAiTasks(req.user.userId, projectIdNum, isAssignedOnly);
  }

  @Post(':id/complete')
  async completeAiTask(@Param('id') id: string, @Request() req) {
    return this.aiTasksService.completeAiTask(parseInt(id), req.user.userId);
  }

  @Post(':id/start')
  async startAiTask(@Param('id') id: string, @Request() req) {
    return this.aiTasksService.startAiTask(parseInt(id), req.user.userId);
  }

  @Post('generate-for-project/:projectId')
  async generateAiTasksForProject(@Param('projectId') projectId: string, @Request() req) {
    return this.aiTasksService.generateAiTasksForProject(parseInt(projectId), req.user.userId);
  }
  @Get('project/:projectId/progress')
  async getProjectProgress(@Param('projectId') projectId: string) {
    return this.aiTasksService.getProjectProgress(parseInt(projectId));
  }

  @Post('assign-daily-tasks/:projectId')
  async assignDailyTasks(@Param('projectId') projectId: string, @Request() req) {
    return this.aiTasksService.assignDailyTasks(parseInt(projectId), req.user.userId);
  }
}
