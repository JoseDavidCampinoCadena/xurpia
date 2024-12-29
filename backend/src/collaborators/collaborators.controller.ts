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
import {
  AddCollaboratorDto,
  UpdateCollaboratorDto,
} from './dto/collaborator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('collaborators')
@UseGuards(JwtAuthGuard)
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post()
  addCollaborator(
    @Request() req,
    @Body() addCollaboratorDto: AddCollaboratorDto,
  ) {
    return this.collaboratorsService.addCollaborator(
      req.user.userId,
      addCollaboratorDto,
    );
  }

  @Get('project/:projectId')
  findProjectCollaborators(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    return this.collaboratorsService.findProjectCollaborators(
      req.user.userId,
      +projectId,
    );
  }

  @Patch(':id')
  updateRole(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCollaboratorDto: UpdateCollaboratorDto,
  ) {
    return this.collaboratorsService.updateRole(
      req.user.userId,
      +id,
      updateCollaboratorDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.collaboratorsService.removeCollaborator(req.user.userId, +id);
  }
} 