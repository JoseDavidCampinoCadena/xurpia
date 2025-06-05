import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [forwardRef(() => NotificationsModule)],
  exports: [TasksService],
})
export class TasksModule {}