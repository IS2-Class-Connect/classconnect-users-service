import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Feedback } from '../models/feedback.model';
import { UnknownQuestions } from '../models/unknown.questions.model';

/**
 * Handles database operations related to feedback using Prisma.
 */
@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  //Adds a new feedback in the database.
  async addFeedback(data: Feedback): Promise<Feedback> {
    return await this.prisma.prisma.feedback.upsert({
      where: {
        user_answer_unique: {
          userId: data.userId,
          answer: data.answer,
        },
      },
      update: {
        comment_feedback: data.comment_feedback,
        rating: data.rating,
        createdAt: new Date(),
      },
      create: data,
    });
  }


  //Adds a new unknown question in the database.
  async addUnknownQuestions(unknownQuestion: string): Promise<UnknownQuestions> {
    return await this.prisma.prisma.unknownQuestions.create({
      data: {
        question: unknownQuestion
      }
    });
  }

}

const logger = new Logger(ChatRepository.name);
