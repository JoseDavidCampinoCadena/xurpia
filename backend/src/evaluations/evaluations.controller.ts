import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { EvaluationsService, Question, EvaluationResult } from './evaluations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

// Enhanced evaluations controller with better error handling
@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}
  @Post('generate-questions')
  async generateQuestions(
    @Body() body: { profession: string; technology: string },
  ): Promise<Question[]> {
    try {
      console.log('🧠 Question generation request:', body);
      
      if (!body.profession || !body.technology) {
        throw new HttpException('Missing required fields: profession and technology', HttpStatus.BAD_REQUEST);
      }

      const questions = await this.evaluationsService.generateQuestions(body.profession, body.technology);
      console.log('✅ Questions generated successfully:', questions.length);
      return questions;
    } catch (error) {
      console.error('❌ Error in generateQuestions controller:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to generate questions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('submit')
  async submitEvaluation(
    @GetUser() user: any,
    @Body() body: {
      profession: string;
      technology: string;
      questions: Question[];
      userAnswers: number[];
    },
  ): Promise<EvaluationResult> {
    try {
      console.log('📝 Evaluation submission received from user:', user?.id);
      console.log('📝 Submission data:', {
        profession: body.profession,
        technology: body.technology,
        questionsCount: body.questions?.length,
        answersCount: body.userAnswers?.length
      });

      if (!user || !user.id) {
        throw new Error('User not authenticated or invalid user data');
      }

      if (!body.profession || !body.technology) {
        throw new Error('Missing required fields: profession and technology');
      }

      if (!body.questions || !Array.isArray(body.questions) || body.questions.length === 0) {
        throw new Error('Invalid or missing questions array');
      }

      if (!body.userAnswers || !Array.isArray(body.userAnswers)) {
        throw new Error('Invalid or missing userAnswers array');
      }

      const result = await this.evaluationsService.evaluateAnswers(
        user.id,
        body.profession,
        body.technology,
        body.questions,
        body.userAnswers,
      );      console.log('✅ Evaluation completed successfully for user:', user.id);
      return result;
    } catch (error) {
      console.error('❌ Error in submitEvaluation controller:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Evaluation submission failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getUserEvaluations(@GetUser() user: any) {
    return this.evaluationsService.getUserEvaluations(user.id);
  }
}
