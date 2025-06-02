import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { EmailModule } from './email/email.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { AiModule } from './AI/ai.module';

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
    UsersModule,
    MessagesModule,
    AiModule,
  ],
})
export class AppModule {}