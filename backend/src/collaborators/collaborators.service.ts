import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCollaboratorDto, UpdateCollaboratorDto } from './dto/collaborator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CollaboratorsService {
  constructor(private prisma: PrismaService) {}

  async addCollaborator(userId: number, dto: AddCollaboratorDto) {
    console.log('addCollaborator called with:', { userId, dto });

    // Verificar si el proyecto existe y si el usuario actual es el propietario
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        collaborators: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('Project found:', project);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can add collaborators');
    }

    // Buscar o crear el usuario colaborador
    let collaboratorUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    console.log('Collaborator user found or created:', collaboratorUser);

    if (!collaboratorUser) {
      // Si el usuario no existe, lo creamos
      const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
      collaboratorUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
        }
      });

      console.log('New collaborator user created:', collaboratorUser);
    }

    // Verificar si el usuario ya es colaborador usando una consulta directa
    const existingCollaborator = await this.prisma.collaborator.findFirst({
      where: {
        AND: [
          { projectId: dto.projectId },
          { userId: collaboratorUser.id }
        ]
      }
    });

    console.log('Existing collaborator check:', existingCollaborator);

    if (existingCollaborator) {
      throw new ConflictException('User is already a collaborator');
    }

    // Crear el colaborador
    const collaborator = await this.prisma.collaborator.create({
      data: {
        userId: collaboratorUser.id,
        projectId: dto.projectId,
        role: dto.role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Collaborator created:', collaborator);

    return collaborator;
  }

  async findProjectCollaborators(userId: number, projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
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

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isCollaborator = project.collaborators.some(
      (c) => c.userId === userId,
    );

    if (!isCollaborator && project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project.collaborators;
  }

  async updateRole(
    userId: number,
    collaboratorId: number,
    dto: UpdateCollaboratorDto,
  ) {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: { id: collaboratorId },
      include: {
        project: true,
      },
    });

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    if (collaborator.project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can update roles');
    }

    return this.prisma.collaborator.update({
      where: { id: collaboratorId },
      data: { role: dto.role },
      include: {
        user: {
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

  async removeCollaborator(userId: number, collaboratorId: number) {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: { id: collaboratorId },
      include: {
        project: true,
      },
    });

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    if (collaborator.project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can remove collaborators');
    }

    await this.prisma.collaborator.delete({
      where: { id: collaboratorId },
    });

    return { message: 'Collaborator removed successfully' };
  }
} 