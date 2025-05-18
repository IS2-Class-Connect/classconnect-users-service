import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatService } from '../service/chat.service';
import { Feedback } from '../models/feedback.model';
import { UnknownQuestion } from 'src/models/unknown-questions';

@Controller('users/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body('question') question: string): Promise<{ answer: string }> {
    this.logger.log(`Received chat question: ${question}`);

    if (!question || question.trim().length === 0) {
      throw new Error('Pregunta vacía no permitida');
    }

    const answer = await this.chatService.ask(question);
    return { answer };
  }

  @Post('/feedback')
  async feedback(@Body() body: Feedback
  ): Promise<Feedback>{
    this.logger.log(`Adding feedback`);
    return await this.chatService.addFeedback(body);
  }

  @Post('/unknown-question')
  async UnknownQuestion(@Body() body: UnknownQuestion
  ): Promise<UnknownQuestion>{
    this.logger.log(`Adding unknown question`);
    return await this.chatService.addAnUnknownQuestion(body);
  }

}
