import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage({ fromUserId, toUserId, content }) {
    return this.prisma.message.create({
      data: { fromUserId, toUserId, content },
    });
  }
}
