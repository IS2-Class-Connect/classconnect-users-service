import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../service/chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
