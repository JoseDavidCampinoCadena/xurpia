import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MessagesService {
  private prismaClient = new PrismaClient();
  constructor(private prisma: PrismaService) {}

  async sendMessage(fromUserId: number, toUserId: number, content: string) {
    return this.prisma.message.create({
      data: { fromUserId, toUserId, content },
    });
  }

  async getMessages(userId: number, otherUserId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getChatsForProjectUser(projectId: number, userId: number) {
    const collaborators = await this.prismaClient.collaborator.findMany({
      where: { projectId, userId: { not: userId } },
      include: { user: true },
    });
    const chats = await Promise.all(
      collaborators.map(async (collab) => {
        const lastMsg = await this.prismaClient.message.findFirst({
          where: {
            OR: [
              { fromUserId: userId, toUserId: collab.userId },
              { fromUserId: collab.userId, toUserId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        return {
          user: {
            id: collab.user.id,
            name: collab.user.name,
            email: collab.user.email,
            profileImage: collab.user.profileImage,
          },
          lastMessage: lastMsg?.content || '',
          lastDate: lastMsg?.createdAt || '',
        };
      }),
    );
    chats.sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime(),
    );
    return chats;
  }
}
