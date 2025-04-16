import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const PORT = 3001;

/**
 * The `bootstrap` function is responsible for initializing the NestJS application.
 * It creates the app using `NestFactory.create` with the `AppModule`.
 * Then, it retrieves configuration values (host, port, and database URL) using `ConfigService`.
 * The `PrismaService` is accessed to ensure proper database initialization.
 * After gathering the configuration, it attempts to start the server and listen on the specified host and port.
 * If the application starts successfully, it logs the server's URL and the database connection string.
 * If an error occurs during startup, it logs the error using `Logger`.
 */
export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const host = configService.get<string>('HOST', '0.0.0.0');
  const port = configService.get<number>('PORT', PORT);
  const databaseUrl = configService.get<string>('DATABASE_URL');

  app.get(PrismaService);

  try {
    await app.listen(port, host);
    logger.log(`Server is running at http://${host}:${port}`);
    logger.log(`Database connected at ${databaseUrl}`);
  } catch (error) {
    logger.error('Error starting the application', error);
  }
}

bootstrap().catch((error) => Logger.error('Error during application startup', error));

const logger = new Logger('Main');
