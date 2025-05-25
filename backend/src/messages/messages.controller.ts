import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Request() req, @Body() body: { toUserId: number; content: string }) {
    return this.messagesService.sendMessage(req.user.userId, body.toUserId, body.content);
  }

  @Get()
  async getMessages(@Request() req, @Query('otherUserId') otherUserId: string) {
    return this.messagesService.getMessages(req.user.userId, Number(otherUserId));
  }

  @Get('chats-summary')
  async getChatsForProjectUser(@Query('projectId') projectId: string, @Query('userId') userId: string) {
    return this.messagesService.getChatsForProjectUser(Number(projectId), Number(userId));
  }
}
