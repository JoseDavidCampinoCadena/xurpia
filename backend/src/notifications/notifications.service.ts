import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async createTaskAssignmentNotification(
    userId: number,
    taskId: number,
    taskTitle: string,
    projectName: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: 'TASK_ASSIGNMENT',
        title: 'Nueva tarea asignada',
        message: `Se te ha asignado la tarea "${taskTitle}" en el proyecto ${projectName}`,
        data: JSON.stringify({
          taskId,
          taskTitle,
          projectName,
        }),
        read: false,
      },
    });
  }
  async create(data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    data?: string;
    relatedId?: number;
  }) {
    const { relatedId, ...createData } = data;
    return this.prisma.notification.create({
      data: {
        ...createData,
        data: data.data || JSON.stringify({ relatedId }),
        read: false,
      },
    });
  }

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user can only mark their own notifications
      },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
