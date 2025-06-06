import { Test, TestingModule } from '@nestjs/testing';
import { ChatRepository } from '../database/chat_database';
import { PrismaService } from '../../prisma/prisma.service';
import { Feedback } from '../models/feedback.model';
import { UnknownQuestions } from '../models/unknown.questions.model';

describe('ChatRepository', () => {
  let repository: ChatRepository;
  let prisma: PrismaService;

  const mockPrismaService = {
    prisma: {
      feedback: {
        create: jest.fn(),
      },
      unknownQuestions: {
        create: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });
/*
  it('should add feedback', async () => {
    const input: Feedback = {
      id: 'abc123',
      answer: 'Sí, entendí.',
      comment_feedback: 'Todo bien',
      rating: 5,
      userId: 'user-456',
    };

    const expected = { ...input };
    (prisma.prisma.feedback.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.addFeedback(input);

    expect(result).toEqual(expected);
    expect(prisma.prisma.feedback.create).toHaveBeenCalledWith({ data: input });
  });
*/
  it('should add unknown question', async () => {
    const question = '¿Cuál es la raíz cuadrada de -1?';
    const expected: UnknownQuestions = {
      id: 'uq1',
      question,
      createdAt: new Date(),
    };

    (prisma.prisma.unknownQuestions.create as jest.Mock).mockResolvedValue(expected);

    const result = await repository.addUnknownQuestions(question);

    expect(result).toEqual(expected);
    expect(prisma.prisma.unknownQuestions.create).toHaveBeenCalledWith({
      data: { question },
    });
  });
});
