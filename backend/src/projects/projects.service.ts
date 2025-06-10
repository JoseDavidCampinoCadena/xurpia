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
  ) {}  async create(userId: number, dto: CreateProjectDto) {
    // Generate unique invitationCode
    let invitationCode: string;
    let isUnique = false;
    do {
      invitationCode = randomBytes(6).toString('hex');
      const existing = await this.prisma.project.findUnique({ where: { invitationCode } });
      if (!existing) isUnique = true;
    } while (!isUnique);

    // Create project immediately without waiting for AI analysis
    let estimatedDuration = dto.estimatedDuration || '2 meses';

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        logo: dto.logo,
        location: dto.location,
        lastConnection: dto.lastConnection ? new Date(dto.lastConnection) : new Date(),
        description: dto.description,
        estimatedDuration: estimatedDuration,
        aiTimeline: null, // Will be updated asynchronously
        totalAiTasks: 0, // Will be updated asynchronously
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

    // Perform AI analysis asynchronously (don't await this)
    if (dto.description && dto.description.trim()) {
      this.performAsyncAIAnalysis(project.id, dto.name, dto.description, estimatedDuration)
        .catch(error => {
          console.error('Async AI analysis failed for project', project.id, ':', error);
        });
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
    );    if (!isCollaborator && project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async getBasicInfo(userId: number, id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
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

  private async performAsyncAIAnalysis(projectId: number, projectName: string, description: string, estimatedDuration: string) {
    try {
      console.log(`Starting async AI analysis for project ${projectId}`);
      
      // Perform AI analysis (this was the synchronous operation causing timeouts)
      const aiAnalysis = await this.aiService.analyzeProject(
        projectName,
        description,
        estimatedDuration
      );

      // Update project with AI analysis results
      if (aiAnalysis) {
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            aiTimeline: aiAnalysis.aiTimeline || null,
            totalAiTasks: aiAnalysis.dailyTasksPlan?.tasksPerDay?.reduce(
              (total: number, day: any) => total + (day.tasks?.length || 0), 
              0
            ) || 0,
          },
        });

        // Generate AI tasks if analysis was successful
        if (aiAnalysis.dailyTasksPlan) {
          await this.generateAiTasksFromAnalysis(projectId, aiAnalysis.dailyTasksPlan);
          console.log(`AI analysis completed successfully for project ${projectId}`);
        }
      }
    } catch (error) {
      console.error(`AI analysis failed for project ${projectId}:`, error);
      // Don't throw error - project creation should succeed even if AI analysis fails
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