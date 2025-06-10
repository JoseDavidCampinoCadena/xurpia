import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAssessmentDto, CreateQuestionsDto } from './dto/skill-assessment.dto';

@Injectable()
export class SkillAssessmentsService {
  constructor(private prisma: PrismaService) {}

  // Default questions for projects that don't have custom questions
  private getDefaultQuestions() {
    return [
      {
        question: '¿Cuál es la diferencia entre let, const y var en JavaScript?',
        options: [
          'No hay diferencia, son sinónimos',
          'let y const tienen scope de bloque, var tiene scope de función',
          'Solo var puede ser reasignado',
          'const es solo para números'
        ],
        correctAnswer: 1,
        difficulty: 'BEGINNER' as const,
        category: 'JavaScript'
      },
      {
        question: '¿Qué es un closure en JavaScript?',
        options: [
          'Una función que tiene acceso a variables de su scope externo',
          'Una función que no retorna nada',
          'Una función que se ejecuta inmediatamente',
          'Una función con parámetros opcionales'
        ],
        correctAnswer: 0,
        difficulty: 'INTERMEDIATE' as const,
        category: 'JavaScript'
      },
      {
        question: '¿Cuál es la complejidad temporal del algoritmo QuickSort en el peor caso?',
        options: [
          'O(n)',
          'O(n log n)',
          'O(n²)',
          'O(log n)'
        ],
        correctAnswer: 2,
        difficulty: 'ADVANCED' as const,
        category: 'Algoritmos'
      },
      {
        question: '¿Qué comando de Git se usa para deshacer el último commit manteniendo los cambios?',
        options: [
          'git revert HEAD',
          'git reset --soft HEAD~1',
          'git reset --hard HEAD~1',
          'git checkout HEAD~1'
        ],
        correctAnswer: 1,
        difficulty: 'INTERMEDIATE' as const,
        category: 'Git'
      },
      {
        question: '¿Cuál es la diferencia entre una API REST y GraphQL?',
        options: [
          'No hay diferencia significativa',
          'REST usa HTTP, GraphQL no',
          'GraphQL permite consultas más específicas y eficientes',
          'REST es más moderno que GraphQL'
        ],
        correctAnswer: 2,
        difficulty: 'INTERMEDIATE' as const,
        category: 'APIs'
      },
      {
        question: '¿Qué es el Virtual DOM en React?',
        options: [
          'Una copia del DOM real que se mantiene en memoria para optimizar actualizaciones',
          'Una herramienta de debugging',
          'Un tipo especial de componente',
          'Una librería externa de React'
        ],
        correctAnswer: 0,
        difficulty: 'BEGINNER' as const,
        category: 'React'
      },
      {
        question: '¿Cuál es el patrón de diseño Singleton?',
        options: [
          'Un patrón que permite múltiples instancias de una clase',
          'Un patrón que garantiza que una clase tenga solo una instancia',
          'Un patrón para crear objetos complejos',
          'Un patrón para observar cambios en objetos'
        ],
        correctAnswer: 1,
        difficulty: 'INTERMEDIATE' as const,
        category: 'Patrones de Diseño'
      },
      {
        question: '¿Qué es la normalización en bases de datos?',
        options: [
          'Proceso de encriptar datos',
          'Proceso de organizar datos para reducir redundancia',
          'Proceso de hacer backup de la base de datos',
          'Proceso de optimizar consultas'
        ],
        correctAnswer: 1,
        difficulty: 'INTERMEDIATE' as const,
        category: 'Bases de Datos'
      }
    ];
  }

  async getQuestions(projectId: number) {
    // First check if project has custom questions
    const customQuestions = await this.prisma.skillQuestion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    if (customQuestions.length > 0) {
      return customQuestions;
    }

    // Return default questions if no custom questions exist
    return this.getDefaultQuestions().map((q, index) => ({
      id: index + 1,
      projectId,
      ...q,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  async submitAssessment(userId: number, projectId: number, dto: SubmitAssessmentDto) {
    // Check if user already has an assessment for this project
    const existingAssessment = await this.prisma.skillAssessment.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (existingAssessment) {
      throw new BadRequestException('Ya has completado una evaluación para este proyecto');
    }

    // Get questions (custom or default)
    const questions = await this.getQuestions(projectId);
    
    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questions.length;
    
    questions.forEach((question) => {
      const userAnswer = dto.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Determine skill level based on score
    let skillLevel: string;
    if (score >= 80) {
      skillLevel = 'Avanzado';
    } else if (score >= 60) {
      skillLevel = 'Intermedio';
    } else {
      skillLevel = 'Principiante';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(skillLevel, score);

    // Save assessment
    const assessment = await this.prisma.skillAssessment.create({
      data: {
        userId,
        projectId,
        skillLevel,
        score,
        answers: dto.answers
      }
    });

    return {
      skillLevel,
      score,
      totalQuestions,
      correctAnswers,
      recommendations
    };
  }

  private generateRecommendations(skillLevel: string, score: number): string[] {
    const recommendations: string[] = [];

    switch (skillLevel) {
      case 'Principiante':
        recommendations.push('Enfócate en conceptos fundamentales de programación');
        recommendations.push('Practica con ejercicios básicos de algoritmos');
        recommendations.push('Estudia los conceptos básicos del lenguaje principal del proyecto');
        if (score < 40) {
          recommendations.push('Considera tomar un curso introductorio antes de participar activamente');
        }
        break;

      case 'Intermedio':
        recommendations.push('Profundiza en patrones de diseño y mejores prácticas');
        recommendations.push('Participa en code reviews para aprender de otros desarrolladores');
        recommendations.push('Experimenta con diferentes herramientas y frameworks');
        break;

      case 'Avanzado':
        recommendations.push('Considera ser mentor de otros miembros del equipo');
        recommendations.push('Lidera la implementación de funcionalidades complejas');
        recommendations.push('Comparte tu conocimiento mediante documentación técnica');
        break;
    }

    return recommendations;
  }

  async getProjectAssessments(projectId: number) {
    return this.prisma.skillAssessment.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });
  }

  async getUserAssessment(userId: number, projectId: number) {
    const assessment = await this.prisma.skillAssessment.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return assessment;
  }

  async updateQuestions(projectId: number, dto: CreateQuestionsDto) {
    // Delete existing custom questions
    await this.prisma.skillQuestion.deleteMany({
      where: { projectId }
    });

    // Create new questions
    const questions = await this.prisma.skillQuestion.createMany({
      data: dto.questions.map(q => ({
        ...q,
        projectId
      }))
    });

    return this.prisma.skillQuestion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async resetUserAssessment(projectId: number, userId: number) {
    const deleted = await this.prisma.skillAssessment.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    return { message: 'Assessment reset successfully' };
  }

  async reassignTasks(projectId: number) {
    // Get all assessments for the project
    const assessments = await this.prisma.skillAssessment.findMany({
      where: { projectId },
      include: { user: true }
    });

    if (assessments.length === 0) {
      throw new BadRequestException('No hay evaluaciones completadas para reasignar tareas');
    }

    // Get all unassigned AI tasks
    const unassignedTasks = await this.prisma.aITask.findMany({
      where: {
        projectId,
        assigneeId: null
      },
      orderBy: [
        { dayNumber: 'asc' },
        { skillLevel: 'asc' }
      ]
    });

    if (unassignedTasks.length === 0) {
      return { assignedTasks: 0, message: 'No hay tareas sin asignar' };
    }

    // Group users by skill level
    const usersBySkill = assessments.reduce((acc, assessment) => {
      const skillLevel = assessment.skillLevel;
      if (!acc[skillLevel]) {
        acc[skillLevel] = [];
      }
      acc[skillLevel].push(assessment.user);
      return acc;
    }, {} as Record<string, any[]>);

    let assignedCount = 0;

    // Assign tasks based on skill level matching
    for (const task of unassignedTasks) {
      const taskSkillLevel = task.skillLevel;
      const availableUsers = usersBySkill[taskSkillLevel] || [];

      if (availableUsers.length > 0) {
        // Simple round-robin assignment
        const userIndex = assignedCount % availableUsers.length;
        const assignedUser = availableUsers[userIndex];

        await this.prisma.aITask.update({
          where: { id: task.id },
          data: { assigneeId: assignedUser.id }
        });

        assignedCount++;
      }
    }

    return {
      assignedTasks: assignedCount,
      message: `Se asignaron ${assignedCount} tareas basándose en las evaluaciones de habilidad`
    };
  }
}
