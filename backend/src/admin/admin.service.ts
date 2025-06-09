import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async deleteAllUsers() {
    try {
      // Delete in order to respect foreign key constraints
      
      // 1. Delete all UserEvaluations
      await this.prisma.userEvaluation.deleteMany({});
      
      // 2. Delete all Notifications
      await this.prisma.notification.deleteMany({});
      
      // 3. Delete all Messages
      await this.prisma.message.deleteMany({});
      
      // 4. Delete all Notes
      await this.prisma.note.deleteMany({});
      
      // 5. Delete all Conversations
      await this.prisma.conversation.deleteMany({});      // 6. Delete all Events (user-related ones) - delete all events for simplicity
      await this.prisma.event.deleteMany({});
      
      // 7. Update AITasks to remove assignee references
      await this.prisma.aITask.updateMany({
        where: {
          assigneeId: {
            not: null
          }
        },
        data: {
          assigneeId: null
        }
      });
      
      // 8. Update Tasks to remove assignee references
      await this.prisma.task.updateMany({
        where: {
          assigneeId: {
            not: null
          }
        },
        data: {
          assigneeId: null
        }
      });
      
      // 9. Delete all Collaborators
      await this.prisma.collaborator.deleteMany({});
      
      // 10. Delete all Projects (this will cascade delete related Tasks, AITasks, Events, etc.)
      await this.prisma.project.deleteMany({});
      
      // 11. Finally, delete all Users
      const deletedUsers = await this.prisma.user.deleteMany({});
      
      return {
        success: true,
        message: `Successfully deleted ${deletedUsers.count} users and all related data`,
        deletedCount: deletedUsers.count
      };
      
    } catch (error) {
      console.error('Error deleting users:', error);
      throw new Error(`Failed to delete users: ${error.message}`);
    }
  }

  async resetDatabase() {
    try {
      // This will delete ALL data from all tables
      await this.prisma.userEvaluation.deleteMany({});
      await this.prisma.notification.deleteMany({});
      await this.prisma.message.deleteMany({});
      await this.prisma.note.deleteMany({});
      await this.prisma.conversation.deleteMany({});
      await this.prisma.event.deleteMany({});
      await this.prisma.aITask.deleteMany({});
      await this.prisma.task.deleteMany({});
      await this.prisma.collaborator.deleteMany({});
      await this.prisma.project.deleteMany({});
      await this.prisma.user.deleteMany({});
      
      return {
        success: true,
        message: 'Database has been completely reset'
      };
      
    } catch (error) {
      console.error('Error resetting database:', error);
      throw new Error(`Failed to reset database: ${error.message}`);
    }
  }
}
