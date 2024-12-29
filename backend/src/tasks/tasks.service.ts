import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto) {
    // Verificar si el usuario tiene acceso al proyecto
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
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.task.create({
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
  }

  async findAll(userId: number) {
    return this.prisma.task.findMany({
      where: {
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

    return this.prisma.task.update({
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
} 