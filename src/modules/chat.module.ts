import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../service/chat.service';
import { ChatRepository } from '../database/chat_database';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  controllers: [ChatController],
  providers: [ChatService,ChatRepository],
})
export class ChatModule {}
