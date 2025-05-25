import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { AddCollaboratorDto, UpdateCollaboratorDto } from './dto/collaborator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from '../email/email.service';
import { RecommendCollaboratorsDto } from './dto/recommend-collaborators.dto';
import axios from 'axios';

@Controller('collaborators')
@UseGuards(JwtAuthGuard)
export class CollaboratorsController {
  constructor(
    private readonly collaboratorsService: CollaboratorsService,
    private readonly emailService: EmailService, // Inyectamos el servicio de email
  ) {}

  @Post()
  async addCollaborator(@Request() req, @Body() addCollaboratorDto: AddCollaboratorDto) {
    console.log('📩 Datos recibidos en el backend:', addCollaboratorDto); // ⬅️ Aquí lo pones

    const collaborator = await this.collaboratorsService.addCollaborator(req.user.userId, addCollaboratorDto);

    await this.emailService.sendInvitationEmail(
      addCollaboratorDto.email,
      addCollaboratorDto.projectName, // Asegurar que este campo venga en el DTO
      addCollaboratorDto.role // Pasar el rol del colaborador
    );

    return collaborator;
  }

  @Post('generate-invitation-code')
  async generateInvitationCode(@Request() req, @Body() body: { projectId: number }) {
    // Solo el owner puede generar el código
    const project = await this.collaboratorsService['prisma'].project.findUnique({
      where: { id: body.projectId },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    if (project.ownerId !== req.user.userId) {
      throw new Error('Solo el owner puede generar el código de invitación.');
    }
    // Si ya tiene invitationCode, lo retorna
    if (project.invitationCode) {
      return { code: project.invitationCode };
    }
    // Generar uno nuevo y guardarlo
    let code: string;
    let isUnique = false;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await this.collaboratorsService['prisma'].project.findUnique({ where: { invitationCode: code } });
      if (!existing) isUnique = true;
    } while (!isUnique);
    await this.collaboratorsService['prisma'].project.update({
      where: { id: body.projectId },
      data: { invitationCode: code },
    });
    return { code };
  }

  @Get('project/:projectId')
  findProjectCollaborators(@Request() req, @Param('projectId') projectId: string) {
    return this.collaboratorsService.findProjectCollaborators(req.user.userId, +projectId);
  }

  @Patch(':id')
  updateRole(@Request() req, @Param('id') id: string, @Body() updateCollaboratorDto: UpdateCollaboratorDto) {
    return this.collaboratorsService.updateRole(req.user.userId, +id, updateCollaboratorDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.collaboratorsService.removeCollaborator(req.user.userId, +id);
  }

  @Post('join-by-code')
  async joinByInvitationCode(@Request() req, @Body() body: { code: string }) {
    // Buscar el proyecto por invitationCode
    const project = await this.collaboratorsService['prisma'].project.findUnique({
      where: { invitationCode: body.code },
    });
    if (!project) {
      throw new Error('Código de invitación inválido.');
    }
    // Validar límite de proyectos (1 propio, 2 como colaborador)
    const userId = req.user.userId;
    const ownedCount = await this.collaboratorsService['prisma'].project.count({ where: { ownerId: userId } });
    const collabCount = await this.collaboratorsService['prisma'].collaborator.count({ where: { userId } });
    if (ownedCount + collabCount >= 3) {
      throw new Error('El plan gratuito permite participar en 3 proyectos.');
    }
    // Verificar si ya es colaborador
    const already = await this.collaboratorsService['prisma'].collaborator.findFirst({ where: { projectId: project.id, userId } });
    if (already) {
      throw new Error('Ya eres colaborador de este proyecto.');
    }
    // Agregar como colaborador (rol MEMBER)
    const collaborator = await this.collaboratorsService['prisma'].collaborator.create({
      data: {
        userId,
        projectId: project.id,
        role: 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    return collaborator;
  }

  @Post('recommend')
  async recommendCollaborators(@Body() body: RecommendCollaboratorsDto) {
    // Llama a OpenAI para recomendar usuarios
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');
    const prompt = `Dado el área de interés "${body.interest}", y la siguiente lista de usuarios con su descripción, ¿cuáles 3 usuarios recomendarías para ese interés? Devuelve solo un array de IDs separados por coma.\nUsuarios:\n${body.users.map(u => `ID: ${u.id}, Nombre: ${u.name}, Descripción: ${u.description || ''}`).join('\n')}`;
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un asistente experto en selección de talento.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 50,
      temperature: 0.2,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    // Extrae los IDs del resultado
    const ids = (response.data.choices?.[0]?.message?.content.match(/\d+/g) || []).map(Number);
    return { recommendedUserIds: ids };
  }
}
