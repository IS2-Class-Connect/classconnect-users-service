import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { Feedback } from 'src/models/feedback.model';
import { ChatRepository } from '../database/chat_database';
import {
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ERROR_SERVER } from '../constants/error.constants';
import { UnknownQuestions } from '../models/unknown.questions.model';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://gateway:3000';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  private sessions: Map<string, ChatSession> = new Map();

  constructor(private readonly chatRepository: ChatRepository, private readonly httpService: HttpService,) {
    const apiKey = process.env.GEMINI_API_KEY || 'gemini_api_key';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async getCoursesFromExternalService(userId: string, token: string): Promise<{ enrolled: any[], teaching: any[] }> {
    try {
      console.log(GATEWAY_URL)
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const enrolledCoursesResponse = await this.httpService
        .get(`${GATEWAY_URL}/courses/enrollments?userId=${userId}`, { headers })
        .toPromise();

      const teachingCoursesResponse = await this.httpService
        .get(`${GATEWAY_URL}/courses?teacherId=${userId}`, { headers })
        .toPromise();

      return {
        enrolled: enrolledCoursesResponse?.data,
        teaching: teachingCoursesResponse?.data,
      };
    } catch (error) {
      this.logger.error(`Error fetching courses for user ${userId} from external service`, error);
      return { enrolled: [], teaching: [] };
    }
  }

  private async getOrCreateSession(userId: string, token: string): Promise<ChatSession> {
    const existingSession = this.sessions.get(userId);
    if (existingSession) return existingSession;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    const { enrolled, teaching } = await this.getCoursesFromExternalService(userId, token);

    const enrolledJSON = JSON.stringify(enrolled, null, 2);
    const teachingJSON = JSON.stringify(teaching, null, 2);
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `You are Classy, the virtual assistant for ClassConnect, an educational platform. Your purpose is to help users efficiently with questions about the platform’s features and their courses, providing concise and clear answers.

          About ClassConnect (detailed summary):
          ClassConnect is an educational platform that enables users to:

          Register and log in using email/password, federated identity providers (Google), or biometric authentication.

          Manage user profiles, including viewing and editing personal information such as name, email, and profile picture.

          Create and manage courses and modules (for teachers), including adding, editing, and deleting courses, modules, and educational resources (videos, documents, links).

          Enroll in courses (for students), browse available courses, filter and search courses, view course details, and track enrollment status.

          Interact through feedback systems, where students can rate and comment on courses, and teachers can provide personalized feedback to students.

          Manage assignments and exams, allowing teachers to create, edit, publish, and delete activities; students can view, complete, submit, and receive feedback on these.

          Benefit from AI-assisted grading of compatible assignment types, speeding up evaluation and providing automated scoring.

          Use a fully AI-managed chat assistant to ask questions about the platform and receive guidance.

          Receive push notifications and emails about important events such as new assignments, messages, deadlines, and role changes.

          Administer user roles and permissions (for administrators), including blocking/unblocking users and managing access rights.

          What ClassConnect does NOT allow or provide:
          It does NOT provide medical, legal, or financial advice.

          It does NOT guarantee the absolute accuracy of scientific or academic content; all such information is AI-generated and should be verified independently.

          It does NOT allow sharing of sensitive personal data beyond profile management.

          It does NOT allow users to perform actions outside their assigned permissions (e.g., students cannot create courses).

          User’s courses data:
          Enrolled courses:
          ${enrolledJSON}

          Teaching courses:
          ${teachingJSON}

          Guidelines for your responses:
          Respond concisely and clearly.

          Detect the user’s language and reply in that language. If detection fails, respond in English.

          Only mention that answers are AI-generated and may not be accurate when the question is related to science or academic topics.

          Do not provide medical, legal, or financial advice.

          Do not provide false or misleading information.

          Do not assume information beyond the app’s described features.

          Example disclaimer for science-related answers:
          “This answer was generated by AI and may not be completely accurate. Please verify with reliable sources.` }],
        },
        {
          role: 'model',
          parts: [{ text: "Entendido, estoy listo para asistir a los estudiantes." }],
        },
      ],
    });

    this.sessions.set(userId, chatSession);
    return chatSession;
  }

  async ask(userId: string, question: string, token: string): Promise<string> {
    this.logger.log(`User ${userId} - Processing question: ${question}`);

    try {
      const session = await this.getOrCreateSession(userId, token);
      const { enrolled, teaching } = await this.getCoursesFromExternalService(userId, token);
      const enrolledJSON = JSON.stringify(enrolled, null, 2);
      const teachingJSON = JSON.stringify(teaching, null, 2);
       await session.sendMessage(`Updated courses:
        Enrolled courses:
        ${enrolledJSON}
        Teaching courses:
        ${teachingJSON}`
        );
      const result = await session.sendMessage(question);
      const response = await result.response;
      const text = response.text().trim();
      const unknownResponses = [
        "I don't understand",
        "I can't help you",
        "I don't have enough information",
        "I don't know",
        "I'm not sure",
        "I don't have an answer",
        "I can't answer",
        "I don't have data",
        "I have no knowledge about that",
        "I don't comprehend",
        "I don't have sufficient information",
        "I don't have information ",
        "I wasn't trained to",
        "I can't interpret",
        "I can't find an answer",
        "I can't process",
        "I don't have enough context",
        "I'm not qualified to",
        "I'm an AI and I can't",
        "I'm a language model",
        "As a language model",
        "I don't have the capability to",
        "I cannot provide "
      ];
      const textLower = text.toLowerCase();
      const isUnknownResponse = unknownResponses.some(phrase =>
        textLower.includes(phrase.toLowerCase())
      );

      if (isUnknownResponse) {
         await this.addAnUnknownQuestion(question);
      }

      this.logger.log(`User ${userId} - Received answer from Gemini.`);
      return text;
    } catch (error) {
      this.logger.error(`User ${userId} - Error querying Gemini`, error);
      throw new Error('Error querying Gemini AI');
    }
  }

  /**
   * Adds a new feedback.
   */
  async addFeedback(data: Feedback): Promise<Feedback> {
    try {
      return await this.chatRepository.addFeedback(data);
    } catch (error) {
      this.logger.error('Error while adding feedback', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

  /**
   * Adds an unknown question.
   */
  async addAnUnknownQuestion(unknownQuestion: string): Promise<UnknownQuestions> {
    try {
      return await this.chatRepository.addUnknownQuestions(unknownQuestion);
    } catch (error) {
      this.logger.error('Error while adding unknown question', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
}
