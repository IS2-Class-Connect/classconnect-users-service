import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  private chatSession: ChatSession;

  constructor() {
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
              text: "Sos un asistente de soporte para la plataforma de estudio. Responde de forma clara, precisa y amigable. Usa la información disponible para proporcionar respuestas útiles y relevantes. No hables de nada que no sea relacionado al estudio. Incluí sugerencias y recursos adicionales cuando sea pertinente.",
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
}
