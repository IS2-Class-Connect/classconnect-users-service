import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { Feedback } from 'src/models/feedback.model';
import { UnknownQuestion } from '../models/unknown-questions';
import { ChatRepository } from '../database/chat_database';
import {
  InternalServerErrorException,
} from '@nestjs/common';
import { ERROR_SERVER } from '../constants/error.constants';


@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  private chatSession: ChatSession;

  constructor(private readonly chatRepository: ChatRepository) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    this.chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [
            {
              //ejemplo de contexto q se le podria pasar, falta mejorar.
              text: "Sos un asistente de soporte para la plataforma de estudio. Responde de forma clara, precisa y amigable. Usa la información disponible para proporcionar respuestas útiles y relevantes. No hables de nada que no sea relacionado al estudio. Incluí sugerencias y recursos adicionales cuando sea pertinente. Si no sabes algo, respondé algo entre las líneas de: 'no entiendo', 'no puedo ayudarte', 'no tengo suficiente información', 'no sé', 'no estoy seguro', 'no tengo una respuesta', 'no puedo responder', 'no tengo datos', 'no tengo conocimiento sobre eso', 'no comprendo', 'no tengo información suficiente', 'no fue entrenado para', 'no logro interpretar', 'no encuentro una respuesta', 'no puedo procesar', 'no tengo contexto suficiente', 'no estoy capacitado para', 'soy una ia y no puedo', 'soy un modelo de lenguaje', 'como modelo de lenguaje', 'no tengo capacidad para'.",

            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: "Entendido, estoy listo para asistir a los estudiantes." }],
        },
      ],
    });
  }

  async ask(question: string): Promise<string> {
    this.logger.log(`Processing question: ${question}`);

    try {
      const result = await this.chatSession.sendMessage(question);
      const response = await result.response;
      const text = response.text().trim();

      this.logger.log(`Received answer from Gemini.`);
      return text;
    } catch (error) {
      this.logger.error('Error querying Gemini', error);
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
  async addAnUnknownQuestion(data: UnknownQuestion): Promise<UnknownQuestion> {
    try {
      return await this.chatRepository.addUnknownQuestions(data);
    } catch (error) {
      this.logger.error('Error while adding unknown question', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
}
