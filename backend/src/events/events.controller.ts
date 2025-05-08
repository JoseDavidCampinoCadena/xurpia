import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(':projectId')
  findAll(@Param('projectId') projectId: string) {
    return this.eventsService.findAll(+projectId);
  }

  @Post(':projectId')
  create(@Param('projectId') projectId: string, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(+projectId, createEventDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.eventsService.delete(+id);
  }
}