import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const host = configService.get<string>('HOST', '0.0.0.0');
  const port = configService.get<number>('PORT', 3000);
  const databaseUrl = configService.get<string>('DATABASE_URL');

  app.get(PrismaService);

  try {
    await app.listen(port, host);
    Logger.log(`Server is running at http://${host}:${port}`);
    Logger.log(`Database connected at ${databaseUrl}`);
  } catch (error) {
    Logger.error('Error starting the application', error);
  }
}

bootstrap().catch((error) => Logger.error('Error during application startup', error));
