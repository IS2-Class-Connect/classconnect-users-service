import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../service/chat.service';
import { ChatRepository } from '../database/chat_database';
import { Feedback } from 'src/models/feedback.model';
import { InternalServerErrorException } from '@nestjs/common';
import { UnknownQuestions } from 'src/models/unknown.questions.model';

jest.mock('@google/generative-ai');

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: ChatRepository;

  const mockRepository = {
    addFeedback: jest.fn(),
    addUnknownQuestions: jest.fn(),
  };

  const mockChatSession = {
    sendMessage: jest.fn(),
  };

  const mockResponse = {
    response: {
      text: () => 'Esta es una respuesta válida.',
    },
  };

  const mockGenAI = {
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue(mockChatSession),
    }),
  };

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'fake_api_key';

    jest.mocked(require('@google/generative-ai')).GoogleGenerativeAI.mockImplementation(() => mockGenAI);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ChatRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get<ChatRepository>(ChatRepository);

    // Reasignar porque se inicializa en constructor
    service['chatSession'] = mockChatSession as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ask()', () => {
    it('should return a valid answer from Gemini', async () => {
      mockChatSession.sendMessage.mockResolvedValue(mockResponse);

      const result = await service.ask('¿Qué es NestJS?');

      expect(result).toBe('Esta es una respuesta válida.');
      expect(mockChatSession.sendMessage).toHaveBeenCalledWith('¿Qué es NestJS?');
    });

    it('should add unknown question if AI response is vague', async () => {
      const vagueResponse = {
        response: {
          text: () => 'Lo siento, no tengo información suficiente.',
        },
      };

      mockChatSession.sendMessage.mockResolvedValue(vagueResponse);
      const spy = jest.spyOn(service, 'addAnUnknownQuestion').mockResolvedValue({ id: '1', question: 'pregunta', createdAt: new Date() });

      await service.ask('pregunta');

      expect(spy).toHaveBeenCalledWith('pregunta');
    });

    it('should throw if Gemini API fails', async () => {
      mockChatSession.sendMessage.mockRejectedValue(new Error('Gemini error'));

      await expect(service.ask('algo')).rejects.toThrow('Error querying Gemini AI');
    });
  });

  describe('addFeedback()', () => {
    it('should store feedback successfully', async () => {
      const feedback: Feedback = {
        id: '1',
        answer: 'Sí',
        comment_feedback: 'Bien',
        rating: 5,
        userId: 'user123',
      };

      mockRepository.addFeedback.mockResolvedValue(feedback);

      const result = await service.addFeedback(feedback);
      expect(result).toEqual(feedback);
    });

    it('should throw InternalServerError if feedback fails', async () => {
      mockRepository.addFeedback.mockRejectedValue(new Error('DB error'));

      await expect(service.addFeedback({} as Feedback)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('addAnUnknownQuestion()', () => {
    it('should store unknown question', async () => {
      const unknown: UnknownQuestions = {
        id: '2',
        question: 'Qué es la materia oscura',
        createdAt: new Date(),
      };

      mockRepository.addUnknownQuestions.mockResolvedValue(unknown);

      const result = await service.addAnUnknownQuestion(unknown.question);
      expect(result).toEqual(unknown);
    });

    it('should throw InternalServerError if insert fails', async () => {
      mockRepository.addUnknownQuestions.mockRejectedValue(new Error('fail'));

      await expect(service.addAnUnknownQuestion('x')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
