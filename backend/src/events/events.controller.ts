import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
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

  // Get all events for the current user (personal + project events)
  @Get('user/all')
  findAllUserEvents(@Req() req: any) {
    const userId = req.user.id;
    return this.eventsService.findAllUserEvents(userId);
  }

  // Get personal events for the current user
  @Get('user/personal')
  findUserPersonalEvents(@Req() req: any) {
    const userId = req.user.id;
    return this.eventsService.findUserPersonalEvents(userId);
  }

  // Create a personal event
  @Post('user/personal')
  createPersonalEvent(@Req() req: any, @Body() createEventDto: CreateEventDto) {
    const userId = req.user.id;
    return this.eventsService.createPersonalEvent(userId, createEventDto);
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