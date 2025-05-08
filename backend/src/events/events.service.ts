import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId: number) {
    return this.prisma.event.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    });
  }

  async create(projectId: number, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        projectId,
      },
    });
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
}