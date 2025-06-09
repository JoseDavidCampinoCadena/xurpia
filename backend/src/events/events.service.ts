import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}
  async findAll(projectId: number) {
    const events = await this.prisma.event.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    });
    
    // Convert dates to ISO string format for frontend
    return events.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }));
  }  async create(projectId: number, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        date: new Date(dto.date), // Explicitly convert string to Date
        type: dto.type,
        description: dto.description,
        projectId,
      },
    });
    
    // Return with formatted date
    return {
      ...event,
      date: event.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    };
  }

  async update(eventId: number, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
  
    return this.prisma.event.update({
      where: { id: eventId },
      data: dto,
    });
  }

  async delete(eventId: number) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.delete({ where: { id: eventId } });
  }

  // Personal events (not tied to any project)
  async findUserPersonalEvents(userId: number) {
    const events = await this.prisma.event.findMany({
      where: { 
        projectId: null,
        userId: userId 
      },
      orderBy: { date: 'asc' },
    });
    
    return events.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0],
      isPersonal: true
    }));
  }

  async createPersonalEvent(userId: number, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        date: new Date(dto.date),
        type: dto.type,
        description: dto.description,
        userId: userId,
        projectId: null, // Personal event
      },
    });
    
    return {
      ...event,
      date: event.date.toISOString().split('T')[0],
      isPersonal: true
    };
  }

  // Get all events for a user (personal + project events they have access to)
  async findAllUserEvents(userId: number) {
    // Get personal events
    const personalEvents = await this.findUserPersonalEvents(userId);
    
    // Get all project events where user is owner or collaborator
    const projectEvents = await this.prisma.event.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { 
              collaborators: {
                some: { userId: userId }
              }
            }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'asc' },
    });

    const formattedProjectEvents = projectEvents.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0],
      isPersonal: false,
      projectName: event.project.name
    }));

    // Combine and sort all events
    const allEvents = [...personalEvents, ...formattedProjectEvents];
    return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}