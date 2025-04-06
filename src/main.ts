import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const host = configService.get<string>('HOST', '0.0.0.0');
  const port = configService.get<number>('PORT', 3000);

  const databaseHost = configService.get<string>('DATABASE_HOST');
  const databasePort = configService.get<number>('DATABASE_PORT');
  const databaseName = configService.get<string>('DATABASE_NAME');
  const databaseUser = configService.get<string>('DATABASE_USER');
  const databasePassword = configService.get<string>('DATABASE_PASSWORD');

  const dsn = `postgres://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}?sslmode=disable`;

  app.get(PrismaService);

  try {
    await app.listen(port, host);
    Logger.log(`Server is running at http://${host}:${port}`);
    Logger.log(`Database connected at ${dsn}`);
  } catch (error) {
    Logger.error('Error starting the application', error);
  }
}

bootstrap().catch((error) => Logger.error('Error during application startup', error));