import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatService } from '../service/chat.service';
import { Feedback } from '../models/feedback.model';

@Controller('users/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body('question') question: string, @Body('userId') userId: string, @Body('token') token: string): Promise<{ answer: string }> {
    this.logger.log(`User ${userId} - Received chat question: ${question}`);

    if (!question || question.trim().length === 0) {
      throw new Error('Not allowed empty question');
    }
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const answer = await this.chatService.ask(userId, question,token);
    return { answer };
  }

  @Post('/feedback')
  async feedback(@Body() body: Feedback
  ): Promise<Feedback>{
    this.logger.log(`Adding feedback`);
    return await this.chatService.addFeedback(body);
  }

}
