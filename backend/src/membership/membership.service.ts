import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MembershipInfo {
  type: 'FREE' | 'PRO' | 'ENTERPRISE';
  expiresAt: Date | null;
  evaluationLimits: {
    perProject: number;
    description: string;
  };
  features: string[];
  price: string;
}

export interface EvaluationUsage {
  projectId: number;
  projectName: string;
  technology: string;
  count: number;
  limit: number;
  remaining: number;
}

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  getMembershipInfo(membershipType: 'FREE' | 'PRO' | 'ENTERPRISE'): MembershipInfo {
    const membershipConfig = {
      FREE: {
        type: 'FREE' as const,
        expiresAt: null,
        evaluationLimits: {
          perProject: 1,
          description: '1 evaluación por tecnología por proyecto'
        },
        features: [
          'Asignación de roles y tareas',
          'Acceso a creación y gestión de un proyecto',
          'Visualización de calendario de tareas',
          '1 evaluación por tecnología por proyecto'
        ],
        price: '$0 COP/mes'
      },
      PRO: {
        type: 'PRO' as const,
        expiresAt: null,
        evaluationLimits: {
          perProject: 3,
          description: '3 evaluaciones por tecnología por proyecto'
        },
        features: [
          'Todo lo incluido en la versión gratuita',
          'Asistente de IA para mejores prácticas',
          'Análisis detallado de plazos y eficiencia',
          'Reportes de progreso detallados',
          '3 evaluaciones por tecnología por proyecto'
        ],
        price: '$30,000 COP/mes'
      },
      ENTERPRISE: {
        type: 'ENTERPRISE' as const,
        expiresAt: null,
        evaluationLimits: {
          perProject: Infinity,
          description: 'Evaluaciones ilimitadas'
        },
        features: [
          'Todo lo incluido en la versión Pro',
          'Herramientas avanzadas de análisis de datos',
          'Soporte técnico prioritario',
          'Paneles de control personalizables',
          'Evaluaciones ilimitadas'
        ],
        price: '$120,000 COP/mes'
      }
    };

    return membershipConfig[membershipType];
  }

  async getUserMembership(userId: number): Promise<MembershipInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipType: true,
        membershipExpiresAt: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const membershipInfo = this.getMembershipInfo(user.membershipType);
    membershipInfo.expiresAt = user.membershipExpiresAt;

    return membershipInfo;
  }

  async getEvaluationUsage(userId: number): Promise<EvaluationUsage[]> {
    // Get user with their projects and evaluations
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipType: true,
        projects: {
          select: { id: true, name: true }
        },
        collaborations: {
          select: {
            project: {
              select: { id: true, name: true }
            }
          }
        },
        evaluations: {
          select: {
            projectId: true,
            technology: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Get all projects user has access to
    const allProjects = [
      ...user.projects,
      ...user.collaborations.map(c => c.project)
    ];

    // Get membership limits
    const membershipInfo = this.getMembershipInfo(user.membershipType);
    const limit = membershipInfo.evaluationLimits.perProject;

    // Count evaluations by project and technology
    const usage: EvaluationUsage[] = [];
    
    for (const project of allProjects) {
      // Get unique technologies evaluated in this project
      const projectEvaluations = user.evaluations.filter(e => e.projectId === project.id);
      const technologies = [...new Set(projectEvaluations.map(e => e.technology))];

      for (const technology of technologies) {
        const count = projectEvaluations.filter(e => e.technology === technology).length;
        
        usage.push({
          projectId: project.id,
          projectName: project.name,
          technology,
          count,
          limit: limit === Infinity ? Infinity : limit,
          remaining: limit === Infinity ? Infinity : Math.max(0, limit - count)
        });
      }
    }

    return usage;
  }

  async canCreateEvaluation(userId: number, projectId: number, technology: string): Promise<{
    canCreate: boolean;
    reason?: string;
    currentCount: number;
    limit: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipType: true,
        membershipExpiresAt: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Check if membership is expired (if applicable)
    if (user.membershipExpiresAt && user.membershipExpiresAt < new Date()) {
      return {
        canCreate: false,
        reason: 'Tu membresía ha expirado. Renueva tu plan para continuar.',
        currentCount: 0,
        limit: 0
      };
    }

    // Get current evaluation count
    const currentCount = await this.prisma.userEvaluation.count({
      where: {
        userId,
        projectId,
        technology
      }
    });

    // Get membership limit
    const membershipInfo = this.getMembershipInfo(user.membershipType);
    const limit = membershipInfo.evaluationLimits.perProject;

    if (limit === Infinity) {
      return {
        canCreate: true,
        currentCount,
        limit
      };
    }

    if (currentCount >= limit) {
      const upgradeMessage = user.membershipType === 'FREE' 
        ? 'Actualiza a PRO para obtener 3 evaluaciones por tecnología por proyecto.'
        : user.membershipType === 'PRO'
        ? 'Actualiza a ENTERPRISE para evaluaciones ilimitadas.'
        : 'Has alcanzado el límite máximo de evaluaciones.';

      return {
        canCreate: false,
        reason: `Has alcanzado el límite de evaluaciones (${currentCount}/${limit}). ${upgradeMessage}`,
        currentCount,
        limit
      };
    }

    return {
      canCreate: true,
      currentCount,
      limit
    };
  }

  async upgradeMembership(userId: number, newMembershipType: 'PRO' | 'ENTERPRISE'): Promise<void> {
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        membershipType: newMembershipType,
        membershipExpiresAt: expiresAt
      }
    });
  }

  async downgradeMembership(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        membershipType: 'FREE',
        membershipExpiresAt: null
      }
    });
  }
}
