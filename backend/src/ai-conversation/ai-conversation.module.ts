import { Module } from '@nestjs/common';
import { AiConversationController } from './ai-conversation.controller';
import { AiConversationService } from './ai-conversation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../AI/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AiConversationController],
  providers: [AiConversationService],
  exports: [AiConversationService],
})
export class AiConversationModule {}
