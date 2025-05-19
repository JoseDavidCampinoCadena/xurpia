import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateProjectDto) {
    // Generar invitationCode único
    let invitationCode: string;
    let isUnique = false;
    do {
      invitationCode = randomBytes(6).toString('hex');
      const existing = await this.prisma.project.findUnique({ where: { invitationCode } });
      if (!existing) isUnique = true;
    } while (!isUnique);

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        logo: dto.logo,
        location: dto.location,
        lastConnection: dto.lastConnection ? new Date(dto.lastConnection) : new Date(),
        description: dto.description,
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
}