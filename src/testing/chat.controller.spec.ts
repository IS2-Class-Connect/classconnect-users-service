import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../service/chat.service';
import { Feedback } from '../models/feedback.model';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const mockChatService = {
    ask: jest.fn(),
    addFeedback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: mockChatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

    describe('chat()', () => {
    it('should return an answer from the chat service', async () => {
        const question = '¿Qué es NestJS?';
        const expectedAnswer = 'NestJS es un framework para Node.js';
        mockChatService.ask.mockResolvedValue(expectedAnswer);

        const result = await controller.chat(question);

        expect(result).toEqual({ answer: expectedAnswer });
        expect(mockChatService.ask).toHaveBeenCalledWith(question);
    });

    it('should throw an error if question is empty', async () => {
        await expect(controller.chat('   ')).rejects.toThrow(
        'Pregunta vacía no permitida',
        );
    });
    });

  describe('feedback()', () => {
    it('should return the created feedback', async () => {
      const feedback: Feedback = {
        id: 'f1',
        answer: 'Sí',
        comment_feedback: 'Muy útil',
        rating: 5,
        userId: 'u1',
      };

      mockChatService.addFeedback.mockResolvedValue(feedback);

      const result = await controller.feedback(feedback);

      expect(result).toEqual(feedback);
      expect(mockChatService.addFeedback).toHaveBeenCalledWith(feedback);
    });
  });
});
