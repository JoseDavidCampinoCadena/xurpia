import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { AiService } from '../AI/ai.service';
import { AiTasksService } from '../ai-tasks/ai-tasks.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private aiTasksService: AiTasksService
  ) {}
  async create(userId: number, dto: CreateProjectDto) {
    // Generar invitationCode único
    let invitationCode: string;
    let isUnique = false;
    do {
      invitationCode = randomBytes(6).toString('hex');
      const existing = await this.prisma.project.findUnique({ where: { invitationCode } });
      if (!existing) isUnique = true;
    } while (!isUnique);

    // Perform AI analysis if description and duration are provided
    let aiAnalysis = null;
    let aiTimeline = null;
    let estimatedDuration = dto.estimatedDuration || '2 meses';
    let totalAiTasks = 0;

    if (dto.description && dto.description.trim()) {
      try {
        aiAnalysis = await this.aiService.analyzeProject(
          dto.name,
          dto.description,
          estimatedDuration
        );
        
        if (aiAnalysis && aiAnalysis.dailyTasksPlan) {
          aiTimeline = JSON.stringify(aiAnalysis.dailyTasksPlan);
          totalAiTasks = aiAnalysis.dailyTasksPlan.tasksPerDay?.reduce(
            (total, day) => total + (day.tasks?.length || 0),
            0
          ) || 0;
        }
      } catch (error) {
        console.error('Failed to analyze project with AI:', error);
        // Continue with project creation even if AI analysis fails
      }
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        logo: dto.logo,
        location: dto.location,
        lastConnection: dto.lastConnection ? new Date(dto.lastConnection) : new Date(),
        description: dto.description,
        estimatedDuration: estimatedDuration,
        aiTimeline: aiTimeline,
        totalAiTasks: totalAiTasks,
        completedAiTasks: 0,
        invitationCode,
        owner: { connect: { id: userId } },
        collaborators: {
          create: {
            user: { connect: { id: userId } },
            role: 'ADMIN',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Generate AI tasks if analysis was successful
    if (aiAnalysis && aiAnalysis.dailyTasksPlan && project.id) {
      try {
        await this.generateAiTasksFromAnalysis(project.id, aiAnalysis.dailyTasksPlan);
      } catch (error) {
        console.error('Failed to generate AI tasks:', error);
        // Project is already created, just log the error
      }
    }

    return project;
  }

  async findAll(userId: number) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: true,
      },
    });
  }

  async findOne(userId: number, id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isCollaborator = project.collaborators.some(
      (collab) => collab.userId === userId,
    );

    if (!isCollaborator && project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  private async generateAiTasksFromAnalysis(projectId: number, dailyTasksPlan: any) {
    if (!dailyTasksPlan || !dailyTasksPlan.tasksPerDay) {
      return;
    }

    const aiTasks = [];
    
    for (const dayPlan of dailyTasksPlan.tasksPerDay) {
      if (dayPlan.tasks && Array.isArray(dayPlan.tasks)) {
        for (const task of dayPlan.tasks) {
          aiTasks.push({
            title: task.title || 'Untitled Task',
            description: task.description || '',
            skillLevel: task.skillLevel || 'Intermedio',
            estimatedHours: task.estimatedHours || 4,
            dayNumber: dayPlan.day || 1,
            status: 'PENDING',
            projectId: projectId,
            // assigneeId will be set later by the AI task assignment algorithm
          });
        }
      }
    }

    if (aiTasks.length > 0) {
      await this.prisma.aITask.createMany({
        data: aiTasks,
      });
    }
  }

  async update(userId: number, id: number, dto: UpdateProjectDto) {
    const project = await this.findOne(userId, id);

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can update it');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        lastConnection: dto.lastConnection ? new Date(dto.lastConnection) : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(userId: number, id: number) {
    const project = await this.findOne(userId, id);
    console.log('REMOVE PROJECT DEBUG:', { userId, ownerId: project.ownerId, project });
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can delete it');
    }

    // Eliminar todas las tareas asociadas al proyecto antes de eliminar el proyecto
    await this.prisma.task.deleteMany({ where: { projectId: id } });
    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  async joinProject(userId: number, projectId: number) {
    // Check if user is already a collaborator
    const existing = await this.prisma.collaborator.findFirst({
      where: { userId, projectId },
    });
    if (!existing) {
      await this.prisma.collaborator.create({
        data: { userId, projectId, role: 'MEMBER' },
      });
      // Increment projectsCount
      await this.prisma.user.update({
        where: { id: userId },
        data: { projectsCount: { increment: 1 } },
      });
    }
    return { message: 'Joined project successfully' };
  }
}