import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCollaboratorDto, UpdateCollaboratorDto } from './dto/collaborator.dto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

// Import para OpenAI


@Injectable()
export class CollaboratorsService {


  constructor(private prisma: PrismaService) {
    // Configurar OpenAI con la API key de las variables de entorno
  }

  // --- Método nuevo para IA de contratación ---
  async hireWithAI(prompt: string): Promise<string> {
    // Traer todos los usuarios con la info necesaria (ajusta los campos según tu BD)
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        profession: true,
        languages: true,
        nationality: true,
        email: true,
      },
    });

    const userContext = users.map(u =>
      `Nombre: ${u.name}, Profesión: ${u.profession}, Idiomas: ${u.languages}, País: ${u.nationality}`
    ).join('\n');

    const fullPrompt = `
Un usuario hizo esta solicitud para contratar personal:

"${prompt}"

Aquí están los usuarios registrados:

${userContext}

Por favor, responde con los usuarios que mejor coincidan, explicando por qué los elegiste. Si no hay coincidencias exactas, sugiere los más cercanos.
`;

    const HF_TOKEN = process.env.HF_TOKEN; // Pon tu token en .env
    const model = 'HuggingFaceH4/zephyr-7b-beta'; // o prueba con 'google/gemma-7b-it'

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: fullPrompt,
          parameters: { max_new_tokens: 512, temperature: 0.5 }
        },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const result = response.data[0]?.generated_text || 'No se encontraron coincidencias.';
      return result;
    } catch (error: any) {
      console.error('Error Hugging Face IA:', error?.response?.data || error.message || error);
      if (error.response && error.response.status === 429) {
        return 'La cuota gratuita de IA ha sido superada. Intenta más tarde o usa tu propio token de Hugging Face.';
      }
      if (error.response && error.response.data && error.response.data.error) {
        return `Error IA: ${error.response.data.error}`;
      }
      return 'Ocurrió un error al consultar la IA. Intenta más tarde.';
    }
  }

  // --- Tu código actual sigue igual ---
  async addCollaborator(userId: number, dto: AddCollaboratorDto) {
    console.log('addCollaborator called with:', { userId, dto });

    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        collaborators: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log('Project found:', project);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can add collaborators');
    }

    let collaboratorUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    console.log('Collaborator user found or created:', collaboratorUser);

    if (!collaboratorUser) {
      const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
      collaboratorUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
        },
      });

      console.log('New collaborator user created:', collaboratorUser);
    }

    const existingCollaborator = await this.prisma.collaborator.findFirst({
      where: {
        AND: [{ projectId: dto.projectId }, { userId: collaboratorUser.id }],
      },
    });

    console.log('Existing collaborator check:', existingCollaborator);

    if (existingCollaborator) {
      throw new ConflictException('User is already a collaborator');
    }

    const collaborator = await this.prisma.collaborator.create({
      data: {
        userId: collaboratorUser.id,
        projectId: dto.projectId,
        role: dto.role,
      },
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

    const isCollaborator = project.collaborators.some((c) => c.userId === userId);

    if (!isCollaborator && project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project.collaborators;
  }

  async updateRole(userId: number, collaboratorId: number, dto: UpdateCollaboratorDto) {
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
