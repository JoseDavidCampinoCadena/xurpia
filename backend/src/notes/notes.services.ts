import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: {
        userId,
      },
    });
  }

  async create(createNoteDto: CreateNoteDto, userId: number): Promise<Note> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return this.prisma.note.create({
      data: {
        title: createNoteDto.title,
        content: createNoteDto.content,
        completed: createNoteDto.completed || false,
        user: {
          connect: { id: user.id },
        },
      },
    });
  }

  async update(id: number, data: Partial<CreateNoteDto>) {
    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}