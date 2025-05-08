import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { EmailModule } from './email/email.module';
import { NotesModule } from './notes/notes.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmailModule,
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    CollaboratorsModule,
    NotesModule,
    EventsModule,
  ],
})
export class AppModule {}