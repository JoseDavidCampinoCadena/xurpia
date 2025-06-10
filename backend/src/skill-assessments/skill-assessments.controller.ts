import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkillAssessmentsService } from './skill-assessments.service';
import { SubmitAssessmentDto, CreateQuestionsDto } from './dto/skill-assessment.dto';

@Controller('skill-assessments')
@UseGuards(JwtAuthGuard)
export class SkillAssessmentsController {
  constructor(private readonly skillAssessmentsService: SkillAssessmentsService) {}

  @Get('projects/:projectId/questions')
  async getQuestions(@Param('projectId') projectId: string) {
    return this.skillAssessmentsService.getQuestions(parseInt(projectId));
  }

  @Post('projects/:projectId/submit')
  async submitAssessment(
    @Param('projectId') projectId: string,
    @Request() req,
    @Body() dto: SubmitAssessmentDto
  ) {
    return this.skillAssessmentsService.submitAssessment(
      req.user.userId,
      parseInt(projectId),
      dto
    );
  }

  @Get('projects/:projectId')
  async getProjectAssessments(@Param('projectId') projectId: string) {
    return this.skillAssessmentsService.getProjectAssessments(parseInt(projectId));
  }

  @Get('projects/:projectId/user')
  async getUserAssessment(
    @Param('projectId') projectId: string,
    @Request() req
  ) {
    try {
      return await this.skillAssessmentsService.getUserAssessment(
        req.user.userId,
        parseInt(projectId)
      );
    } catch (error) {
      if (error.message === 'Assessment not found') {
        return null;
      }
      throw error;
    }
  }

  @Put('projects/:projectId/questions')
  async updateQuestions(
    @Param('projectId') projectId: string,
    @Body() dto: CreateQuestionsDto
  ) {
    return this.skillAssessmentsService.updateQuestions(parseInt(projectId), dto);
  }

  @Delete('projects/:projectId/users/:userId')
  async resetUserAssessment(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    return this.skillAssessmentsService.resetUserAssessment(
      parseInt(projectId),
      parseInt(userId)
    );
  }

  @Post('projects/:projectId/reassign-tasks')
  async reassignTasks(@Param('projectId') projectId: string) {
    return this.skillAssessmentsService.reassignTasks(parseInt(projectId));
  }
}
