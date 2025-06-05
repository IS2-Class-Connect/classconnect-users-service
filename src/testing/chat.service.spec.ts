import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../service/chat.service';
import { ChatRepository } from '../database/chat_database';
import { Feedback } from 'src/models/feedback.model';
import { InternalServerErrorException } from '@nestjs/common';
import { UnknownQuestions } from 'src/models/unknown.questions.model';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { AxiosHeaders } from 'axios';
// Mock de GoogleGenerativeAI y ChatSession
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
}));

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

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'fake_api_key';

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    GoogleGenerativeAI.mockImplementation(() => mockGenAI);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ChatRepository, useValue: mockRepository },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get<ChatRepository>(ChatRepository);

    const fakeCourses: AxiosResponse = {
      data: [{ id: '1', name: 'Curso A' }],
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders(),
      },
    };

    mockHttpService.get.mockReturnValue(of(fakeCourses));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ask()', () => {
    it('should return a valid answer from Gemini', async () => {
      mockChatSession.sendMessage.mockResolvedValueOnce({}); 
      mockChatSession.sendMessage.mockResolvedValueOnce(mockResponse); 

      const result = await service.ask('gff3LFNFdHTq4CsOWID6CTAu1so2', '¿Qué es NestJS?', 'fake_token');

      expect(result).toBe('Esta es una respuesta válida.');
      expect(mockChatSession.sendMessage).toHaveBeenCalledWith('¿Qué es NestJS?');
    });

    it('should throw if Gemini API fails', async () => {
      mockChatSession.sendMessage.mockRejectedValue(new Error('Gemini error'));

      await expect(service.ask('gff3LFNFdHTq4CsOWID6CTAu1so2', 'algo', 'fake_token')).rejects.toThrow('Error querying Gemini AI');
    });
  });

  describe('addFeedback()', () => {
    it('should store feedback successfully', async () => {
      const feedback: Feedback = {
        id: '1',
        answer: 'Sí',
        comment_feedback: 'Bien',
        rating: 5,
        userId: 'gff3LFNFdHTq4CsOWID6CTAu1so2',
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
