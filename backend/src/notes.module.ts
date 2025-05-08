import { Module } from '@nestjs/common';
import { NotesController } from './notes/notes.controller';
import { NotesService } from './notes.service';
import { PrismaModule } from './prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Add PrismaModule to imports
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
