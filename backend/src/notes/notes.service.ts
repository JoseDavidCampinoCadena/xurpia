import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Corrected path
import { CreateNoteDto } from './dto/create-note.dto'; // Corrected path
import { UpdateNoteDto } from './dto/update-note.dto'; // Corrected path
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto, userId: number): Promise<Note> {
    return this.prisma.note.create({
      data: {
        title: createNoteDto.title,
        content: createNoteDto.content,
        completed: createNoteDto.completed || false,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findAll(userId: number): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: number, userId: number): Promise<Note> {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found for this user`);
    }
    return note;
  }

  async update(id: number, updateNoteDto: UpdateNoteDto, userId: number): Promise<Note> {
    // First, verify the note exists and belongs to the user
    await this.findOne(id, userId); 
    
    return this.prisma.note.update({
      where: {
        id,
      },
      data: {
        title: updateNoteDto.title,
        content: updateNoteDto.content,
        completed: updateNoteDto.completed
      },
    });
  }

  async remove(id: number, userId: number): Promise<Note> {
    // First, verify the note exists and belongs to the user
    await this.findOne(id, userId);

    return this.prisma.note.delete({
      where: {
        id,
      },
    });
  }
}
