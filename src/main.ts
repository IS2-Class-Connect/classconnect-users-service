import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { responseTimeHistogram, requestCounter, cpuUsageGauge, memoryUsageGauge } from 'src/controllers/metrics.controller';
import * as dotenv from 'dotenv';
import {
  Request,
  Response,
  NextFunction,
} from 'express';
dotenv.config({ path: './.env' });

// Resource fetching for metrics
function setupMetricsFetching() {
  let prevCpuUsage = process.cpuUsage();
  let prevHrTime = process.hrtime();
  setInterval(() => {
    const currCpuUsage = process.cpuUsage(prevCpuUsage);
    const currHrTime = process.hrtime(prevHrTime);

    prevCpuUsage = process.cpuUsage();
    prevHrTime = process.hrtime();

    const elapsedHrTimeSeconds = currHrTime[0] + currHrTime[1] / 1e9;
    const totalCpuMicros = currCpuUsage.user + currCpuUsage.system;

    const cpuPercent = (totalCpuMicros / 1e6 / elapsedHrTimeSeconds) * 100;
    cpuUsageGauge.set(cpuPercent);

    const memoryUsage = process.memoryUsage();
    memoryUsageGauge.set(memoryUsage.rss);
  }, 5000);
}

// Middleware for prometheus metrics
function prometheusMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = responseTimeHistogram.startTimer();

  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode.toString() });
    requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode.toString() });
  });

  next();
}

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

  setupMetricsFetching();
  app.get(PrismaService);
  app.use(prometheusMiddleware);

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
