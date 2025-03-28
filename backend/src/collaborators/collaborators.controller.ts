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
}
