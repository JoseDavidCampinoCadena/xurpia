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
import { AiTasksModule } from './ai-tasks/ai-tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { MembershipModule } from './membership/membership.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';

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
    EventsModule,
    NotesModule,    UsersModule,
    MessagesModule,
    AiModule,
    AiTasksModule,    NotificationsModule,
    EvaluationsModule,
    MembershipModule,
    AdminModule,
  ],
})
export class AppModule {}