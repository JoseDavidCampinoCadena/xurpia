import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: number, dto: CreateTaskDto) {
    console.log('DEBUG createTask - userId:', userId, 'projectId:', dto.projectId);
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
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
        owner: true,
        collaborators: true,
      },
    });
    console.log('DEBUG project found:', project);

    const debugProject = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        owner: true,
        collaborators: true,
      },
    });
    console.log('DEBUG direct project:', debugProject);    if (!project) {
      console.log('DEBUG: No access to project for user', userId, 'on project', dto.projectId);
      throw new ForbiddenException('You do not have access to this project');
    }    const newTask = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'PENDING',
        projectId: dto.projectId,
        assigneeId: dto.assigneeId || null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notification to the assigned user if there is an assignee and it's not the creator
    if (dto.assigneeId && dto.assigneeId !== userId) {
      await this.notificationsService.createTaskAssignmentNotification(
        dto.assigneeId,
        newTask.id,
        newTask.title,
        newTask.project?.name || 'Unknown Project',
      );
    }

    return newTask;
  }
  async findAll(userId: number, assignedOnly: boolean = false) {
    const whereCondition = assignedOnly 
      ? { assigneeId: userId } // Only tasks assigned to the user
      : {
          OR: [
            { assigneeId: userId },
            {
              project: {
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
            },
          ],
        };

    return this.prisma.task.findMany({
      where: whereCondition,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(userId: number, id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          include: {
            owner: true,
            collaborators: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      task.assigneeId === userId ||
      task.project.ownerId === userId ||
      task.project.collaborators.some((collab) => collab.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }
  async update(userId: number, id: number, dto: UpdateTaskDto) {
    const task = await this.findOne(userId, id);

    // Solo el propietario del proyecto o el asignado pueden actualizar la tarea
    if (
      task.project.ownerId !== userId &&
      task.assigneeId !== userId &&
      !task.project.collaborators.some(
        (collab) => collab.userId === userId && collab.role === 'ADMIN',
      )
    ) {
      throw new ForbiddenException('You cannot update this task');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If this is an AI task being completed, also complete the corresponding AI task
    if (dto.status === 'COMPLETED' && task.title.startsWith('[IA]')) {
      try {
        const aiTaskTitle = task.title.replace('[IA] ', '');
        const correspondingAiTask = await this.prisma.aITask.findFirst({
          where: {
            title: aiTaskTitle,
            projectId: task.projectId,
            assigneeId: userId,
            status: { not: 'COMPLETED' }
          }
        });

        if (correspondingAiTask) {
          await this.prisma.aITask.update({
            where: { id: correspondingAiTask.id },
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            }
          });
          console.log(`✅ Synchronized AI task completion: ${aiTaskTitle}`);
        }
      } catch (error) {
        console.error('Error synchronizing AI task completion:', error);
        // Don't throw error, just log it - the regular task update should still succeed
      }
    }

    return updatedTask;
  }
  async remove(userId: number, id: number) {
    const task = await this.findOne(userId, id);

    // Solo el propietario del proyecto puede eliminar tareas
    if (
      task.project.ownerId !== userId &&
      !task.project.collaborators.some(
        (collab) => collab.userId === userId && collab.role === 'ADMIN',
      )
    ) {
      throw new ForbiddenException('Only project owner can delete tasks');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async distributeTasksWithAI(userId: number, projectId: number, criteria: string = 'skills and workload') {
    // Verify user has access to project
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        ],
      },
      include: {
        collaborators: {
          include: {
            user: {
              include: {
                evaluations: true,
              },
            },
          },
        },        tasks: {
          where: {
            assigneeId: null, // Only unassigned tasks
          },
        },
        owner: {
          include: {
            evaluations: true,
          },
        },
      },
    });

    if (!project) {
      throw new ForbiddenException('You do not have permission to distribute tasks for this project');
    }

    if (project.tasks.length === 0) {
      return { message: 'No unassigned tasks to distribute', assignments: [] };
    }

    // Get all project members (owner + collaborators)
    const allMembers = [
      {
        id: project.owner.id,
        name: project.owner.name,
        email: project.owner.email,
        evaluations: project.owner.evaluations,
        currentTaskCount: await this.prisma.task.count({
          where: {
            assigneeId: project.owner.id,
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
        }),
      },
      ...project.collaborators.map(collab => ({
        id: collab.user.id,
        name: collab.user.name,
        email: collab.user.email,
        evaluations: collab.user.evaluations,
        currentTaskCount: 0, // Will be calculated
      })),
    ];

    // Calculate current task counts for collaborators
    for (const member of allMembers.slice(1)) {
      member.currentTaskCount = await this.prisma.task.count({
        where: {
          assigneeId: member.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });
    }

    // Simple AI-like distribution logic
    // In a real implementation, you would integrate with OpenAI or another AI service
    const assignments = [];
    
    // Sort members by current workload (ascending)
    const sortedMembers = [...allMembers].sort((a, b) => a.currentTaskCount - b.currentTaskCount);
    
    for (let i = 0; i < project.tasks.length; i++) {
      const task = project.tasks[i];
      const assignee = sortedMembers[i % sortedMembers.length];
      
      // Update task assignment
      const updatedTask = await this.prisma.task.update({
        where: { id: task.id },
        data: { assigneeId: assignee.id },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Send notification to assigned user
      await this.notificationsService.create({
        userId: assignee.id,
        title: 'Nueva tarea asignada por IA',
        message: `Se te ha asignado la tarea "${task.title}" basada en distribución inteligente.`,
        type: 'TASK_ASSIGNED',
        relatedId: task.id,
      });

      assignments.push({
        task: updatedTask,
        reason: `Asignado a ${assignee.name} por balance de carga de trabajo (${assignee.currentTaskCount} tareas activas)`,
      });

      // Update member's task count for next iteration
      assignee.currentTaskCount++;
    }

    return {
      message: `Successfully distributed ${assignments.length} tasks using AI`,
      assignments,
      criteria,
    };
  }
}