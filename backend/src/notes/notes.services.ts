import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.nota.findMany();
  }

  async create(createNoteDto: CreateNoteDto) {
    return this.prisma.nota.create({
      data: {
        texto: createNoteDto.texto,
        completado: createNoteDto.completado || false,
      },
    });
  }

  async update(id: number, data: Partial<CreateNoteDto>) {
    return this.prisma.nota.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.nota.delete({
      where: { id },
    });
  }
}