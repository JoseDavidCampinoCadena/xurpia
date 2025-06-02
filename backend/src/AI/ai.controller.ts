import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-questions')
  async generateQuestions(@Body('tech') tech: string) {
    return this.aiService.generateQuestions(tech);
  }

  @Post('evaluate-level')
  async evaluateLevel(@Body() body: { answers: string[]; tech: string }) {
    return this.aiService.evaluateLevel(body.answers, body.tech);
  }
}
