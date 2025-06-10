
export class SubmitAssessmentDto {
  answers: Record<number, number>;
}

export class CreateQuestionsDto {
  questions: CreateQuestionDto[];
}

export class CreateQuestionDto {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
}
