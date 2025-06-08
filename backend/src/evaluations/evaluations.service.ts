import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../AI/ai.service';

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

@Injectable()
export class EvaluationsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async generateQuestions(profession: string, technology: string): Promise<Question[]> {
    const prompt = `
Generate exactly 10 multiple choice questions for evaluating a ${profession} developer's knowledge in ${technology}.
The questions should be ordered from easy to hard (first 3 easy, next 4 medium, last 3 hard).
Each question should have 4 options with only one correct answer.

Return a JSON array with this exact format:
[
  {
    "id": 1,
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficulty": "easy"
  }
]

Topics to cover for ${technology}:
- Basic syntax and concepts
- Core features and methods
- Best practices
- Advanced patterns
- Framework-specific knowledge (if applicable)
- Problem-solving scenarios
`;    try {
      const response = await this.aiService.generateText(prompt);
      
      // Try to parse the response as JSON
      let questions;
      try {
        // First try to parse the entire response
        questions = JSON.parse(response);
      } catch (parseError) {
        // If that fails, try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      }

      // Validate the questions format
      if (Array.isArray(questions) && questions.length > 0 && questions[0].question) {
        return questions;
      } else {
        throw new Error('Invalid questions format');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      console.log('Using fallback questions for technology:', technology);
      
      // Return fallback questions with proper error context
      const fallbackQuestions = this.getFallbackQuestions(technology);
      if (fallbackQuestions.length === 0) {
        // If no specific fallback, create generic ones
        return this.getGenericFallbackQuestions(profession, technology);
      }
      return fallbackQuestions;
    }
  }  async evaluateAnswers(
    userId: number,
    profession: string,
    technology: string,
    questions: Question[],
    userAnswers: number[],
    projectId?: number,
  ): Promise<EvaluationResult> {
    try {
      console.log('🔍 Starting evaluation for user:', userId);
      console.log('📊 Evaluation data:', { profession, technology, questionsCount: questions.length, answersCount: userAnswers.length });

      // Validate input data
      if (!userId || typeof userId !== 'number') {
        throw new Error('Invalid userId provided');
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions array provided');
      }

      if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length !== questions.length) {
        throw new Error(`Invalid userAnswers array. Expected ${questions.length} answers, got ${userAnswers?.length}`);
      }      // 🔐 MEMBERSHIP VALIDATION - Check user's membership and evaluation limits
      console.log('🔐 Checking membership limits...');      // Get user with membership info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          projects: true,
          collaborations: {
            include: {
              project: true
            }
          }
        }
      }) as any;

      if (!user) {
        throw new Error('User not found');
      }

      // Get all projects user has access to
      const userProjects = [
        ...user.projects,
        ...user.collaborations.map(c => c.project)
      ];

      if (userProjects.length === 0) {
        throw new Error('Usuario debe pertenecer a al menos un proyecto para realizar evaluaciones');
      }

      // Determine which project to use
      let targetProjectId: number;
      
      if (projectId) {
        // Verify user has access to the specified project
        const hasAccess = userProjects.some(p => p.id === projectId);
        if (!hasAccess) {
          throw new Error('No tienes acceso a este proyecto');
        }
        targetProjectId = projectId;
      } else {
        // Use the first project as default if no projectId provided
        targetProjectId = userProjects[0].id;
      }

      console.log(`📋 Using project ID: ${targetProjectId}`);      // Check existing evaluations for this user, project, and technology
      const existingEvaluations = await this.prisma.userEvaluation.count({
        where: {
          userId: userId,
          projectId: targetProjectId,
          technology: technology
        } as any
      });// Define membership limits
      const membershipLimits = {
        FREE: 1,
        PRO: 3,
        ENTERPRISE: Infinity
      };

      const userLimit = membershipLimits[user.membershipType] || 1;

      console.log(`👤 User membership: ${user.membershipType}, Limit: ${userLimit}, Current: ${existingEvaluations}`);

      if (existingEvaluations >= userLimit) {
        const upgradeMessage = user.membershipType === 'FREE' 
          ? 'Usuarios FREE pueden realizar 1 evaluación por tecnología por proyecto. Actualiza a PRO para 3 evaluaciones.'
          : user.membershipType === 'PRO'
          ? 'Usuarios PRO pueden realizar 3 evaluaciones por tecnología por proyecto. Actualiza a ENTERPRISE para evaluaciones ilimitadas.'
          : 'Has alcanzado el límite de evaluaciones para esta tecnología en este proyecto.';
        
        throw new Error(`Límite de evaluaciones alcanzado. ${upgradeMessage}`);
      }

      let score = 0;
      let easyCorrect = 0;
      let mediumCorrect = 0;
      let hardCorrect = 0;

      questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;
        
        console.log(`Question ${index + 1}: User answer: ${userAnswer}, Correct: ${correctAnswer}, Difficulty: ${question.difficulty}`);
        
        if (userAnswer === correctAnswer) {
          score += 10;
          switch (question.difficulty) {
            case 'easy':
              easyCorrect++;
              break;
            case 'medium':
              mediumCorrect++;
              break;
            case 'hard':
              hardCorrect++;
              break;
          }
        }
      });

      console.log('📈 Score calculation:', { score, easyCorrect, mediumCorrect, hardCorrect });

      let level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
      let feedback: string;

      if (score >= 80 && hardCorrect >= 2) {
        level = 'ADVANCED';
        feedback = `Excelente conocimiento en ${technology}. Dominas conceptos avanzados y mejores prácticas.`;
      } else if (score >= 60 && mediumCorrect >= 2) {
        level = 'INTERMEDIATE';
        feedback = `Buen conocimiento en ${technology}. Tienes una base sólida con algunos conceptos avanzados.`;
      } else {
        level = 'BEGINNER';
        feedback = `Conocimiento básico en ${technology}. Continúa aprendiendo los fundamentos.`;
      }

      console.log('🎯 Final evaluation:', { level, score, feedback });      // Prepare data for database
      const evaluationData = {
        userId,
        projectId: targetProjectId, // Use the determined project ID
        profession,
        technology,
        level,
        score,
        feedback,
        questionsData: JSON.stringify({
          questions,
          userAnswers,
          easyCorrect,
          mediumCorrect,
          hardCorrect,
        }),
      };

      console.log('💾 Saving evaluation to database...');
      
      // Save evaluation to database
      const savedEvaluation = await this.prisma.userEvaluation.create({
        data: evaluationData,
      });

      console.log('✅ Evaluation saved successfully:', savedEvaluation.id);

      return { score, level, feedback };
    } catch (error) {
      console.error('❌ Error in evaluateAnswers:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  async getUserEvaluations(userId: number) {
    return this.prisma.userEvaluation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  private getFallbackQuestions(technology: string): Question[] {
    // Fallback questions for JavaScript
    if (technology.toLowerCase().includes('javascript')) {
      return [
        {
          id: 1,
          question: "¿Cuál es la forma correcta de declarar una variable en JavaScript?",
          options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
          correctAnswer: 0,
          difficulty: "easy"
        },
        {
          id: 2,
          question: "¿Qué tipo de dato devuelve typeof null?",
          options: ["null", "undefined", "object", "boolean"],
          correctAnswer: 2,
          difficulty: "medium"
        },
        {
          id: 3,
          question: "¿Cuál es la diferencia entre let y var?",
          options: ["No hay diferencia", "let tiene scope de bloque", "var es más moderno", "let no puede ser reasignado"],
          correctAnswer: 1,
          difficulty: "medium"
        },
        {
          id: 4,
          question: "¿Qué es una closure en JavaScript?",
          options: ["Una función que se ejecuta inmediatamente", "Una función que tiene acceso a variables de su scope externo", "Una función asíncrona", "Una función sin parámetros"],
          correctAnswer: 1,
          difficulty: "hard"
        },
        {
          id: 5,
          question: "¿Cuál es el resultado de '2' + 2 en JavaScript?",
          options: ["4", "'22'", "Error", "undefined"],
          correctAnswer: 1,
          difficulty: "easy"
        }
      ];
    }
    
    // Fallback for Python
    if (technology.toLowerCase().includes('python')) {
      return [
        {
          id: 1,
          question: "¿Cómo se declara una lista en Python?",
          options: ["list = []", "list = {}", "list = ()", "array = []"],
          correctAnswer: 0,
          difficulty: "easy"
        },
        {
          id: 2,
          question: "¿Qué significa self en Python?",
          options: ["Una palabra clave", "Referencia a la instancia actual", "Un tipo de dato", "Una función"],
          correctAnswer: 1,
          difficulty: "medium"
        }
      ];
    }
    
    return [];
  }

  private getGenericFallbackQuestions(profession: string, technology: string): Question[] {
    return [
      {
        id: 1,
        question: `¿Qué es ${technology}?`,
        options: [`Un lenguaje de programación`, `Una base de datos`, `Un framework`, `Una herramienta de diseño`],
        correctAnswer: 0,
        difficulty: "easy"
      },
      {
        id: 2,
        question: `¿Para qué se utiliza principalmente ${technology}?`,
        options: [`Desarrollo web`, `Análisis de datos`, `Inteligencia artificial`, `Todas las anteriores`],
        correctAnswer: 3,
        difficulty: "easy"
      },
      {
        id: 3,
        question: `¿Cuál es una característica importante de ${technology}?`,
        options: [`Es compilado`, `Es interpretado`, `Es funcional`, `Depende de la implementación`],
        correctAnswer: 3,
        difficulty: "medium"
      },
      {
        id: 4,
        question: `¿Qué tipo de paradigma de programación soporta ${technology}?`,
        options: [`Solo orientado a objetos`, `Solo funcional`, `Solo imperativo`, `Múltiples paradigmas`],
        correctAnswer: 3,
        difficulty: "medium"
      },
      {
        id: 5,
        question: `¿Cuál es una buena práctica al programar en ${technology}?`,
        options: [`Escribir código sin comentarios`, `Usar nombres descriptivos para variables`, `No seguir convenciones`, `Escribir funciones muy largas`],
        correctAnswer: 1,
        difficulty: "hard"
      }
    ];
  }
}
