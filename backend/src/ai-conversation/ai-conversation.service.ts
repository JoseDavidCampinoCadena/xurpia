import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Changed to string for JSON compatibility
}

export interface AIConversation {
  id: string;
  userId: number;
  title: string;
  messages: ChatMessage[];
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AiConversationService {
  constructor(private prisma: PrismaService) {}

  async getUserConversations(userId: number): Promise<AIConversation[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return conversations.map(conv => {
      const messages = (conv.messages as unknown) as ChatMessage[];
      const lastMessage = messages.length > 0 ? 
        messages[messages.length - 1].content.substring(0, 50) + '...' : 
        'Nueva conversación';
      
      return {
        id: conv.id,
        userId: conv.userId,
        title: this.generateConversationTitle(messages),
        messages,
        lastMessage,
        createdAt: conv.createdAt,
        updatedAt: conv.createdAt, // Since we don't have updatedAt in schema
      };
    });
  }

  async getConversationById(conversationId: string, userId: number): Promise<AIConversation | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) return null;

    const messages = (conversation.messages as unknown) as ChatMessage[];
    return {
      id: conversation.id,
      userId: conversation.userId,
      title: this.generateConversationTitle(messages),
      messages,
      lastMessage: messages.length > 0 ? 
        messages[messages.length - 1].content.substring(0, 50) + '...' : 
        'Nueva conversación',
      createdAt: conversation.createdAt,
      updatedAt: conversation.createdAt,
    };
  }

  async createConversation(userId: number, initialMessage: ChatMessage): Promise<AIConversation> {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        messages: JSON.parse(JSON.stringify([initialMessage])), // Properly serialize for JSON
      },
    });

    return {
      id: conversation.id,
      userId: conversation.userId,
      title: this.generateConversationTitle([initialMessage]),
      messages: [initialMessage],
      lastMessage: initialMessage.content.substring(0, 50) + '...',
      createdAt: conversation.createdAt,
      updatedAt: conversation.createdAt,
    };
  }

  async addMessageToConversation(
    conversationId: string, 
    userId: number, 
    newMessage: ChatMessage
  ): Promise<AIConversation> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const currentMessages = (conversation.messages as unknown) as ChatMessage[];
    const updatedMessages = [...currentMessages, newMessage];

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { messages: JSON.parse(JSON.stringify(updatedMessages)) }, // Properly serialize for JSON
    });

    return {
      id: updatedConversation.id,
      userId: updatedConversation.userId,
      title: this.generateConversationTitle(updatedMessages),
      messages: updatedMessages,
      lastMessage: newMessage.content.substring(0, 50) + '...',
      createdAt: updatedConversation.createdAt,
      updatedAt: updatedConversation.createdAt,
    };
  }

  async deleteConversation(conversationId: string, userId: number): Promise<void> {
    await this.prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userId,
      },
    });
  }

  async updateConversationTitle(conversationId: string, userId: number, title: string): Promise<AIConversation> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = (conversation.messages as unknown) as ChatMessage[];
    
    // Note: We're not actually updating the title in the database since it's generated
    // This is more for future compatibility if we add a title field
    return {
      id: conversation.id,
      userId: conversation.userId,
      title,
      messages,
      lastMessage: messages.length > 0 ? 
        messages[messages.length - 1].content.substring(0, 50) + '...' : 
        'Nueva conversación',
      createdAt: conversation.createdAt,
      updatedAt: conversation.createdAt,
    };
  }

  private generateConversationTitle(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Nueva conversación';
    
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'Nueva conversación';
    
    // Generate title from first user message
    const words = firstUserMessage.content.split(' ').slice(0, 6);
    return words.join(' ') + (firstUserMessage.content.split(' ').length > 6 ? '...' : '');
  }
}
