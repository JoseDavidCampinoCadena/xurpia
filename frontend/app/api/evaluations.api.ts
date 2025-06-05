import axios from './axios';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluationResult {
  score: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  feedback: string;
}

export interface UserEvaluation {
  id: number;
  profession: string;
  technology: string;
  level: string;
  score: number;
  createdAt: string;
}

class EvaluationsAPI {
  async generateQuestions(profession: string, technology: string): Promise<Question[]> {
    const response = await axios.post('/evaluations/generate-questions', {
      profession,
      technology,
    });
    return response.data;
  }

  async submitEvaluation(
    profession: string,
    technology: string,
    questions: Question[],
    userAnswers: number[]
  ): Promise<EvaluationResult> {
    const response = await axios.post('/evaluations/submit', {
      profession,
      technology,
      questions,
      userAnswers,
    });
    return response.data;
  }

  async getUserEvaluations(): Promise<UserEvaluation[]> {
    const response = await axios.get('/evaluations');
    return response.data;
  }
}

export const evaluationsApi = new EvaluationsAPI();
