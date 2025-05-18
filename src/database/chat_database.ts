import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Feedback } from '../models/feedback.model';
import { UnknownQuestion } from '../models/unknown-questions';

/**
 * Handles database operations related to feedback using Prisma.
 */
@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  //Adds a new feedback in the database.
  async addFeedback(data: Feedback): Promise<Feedback> {
    return await this.prisma.prisma.feedback.create({ data });
  }

  //Adds a new unknown question in the database.
  async addUnknownQuestions(data: UnknownQuestion): Promise<UnknownQuestion> {
    return await this.prisma.prisma.unknownQuestions.create({ data });
  }

}

const logger = new Logger(ChatRepository.name);
