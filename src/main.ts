import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as client from 'prom-client';
import * as dotenv from 'dotenv';
import {
  Request,
  Response,
  NextFunction,
} from 'express';

// Prometheus Initialization
const register = new client.Registry();
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
const responseTimeHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});
const cpuUsageGauge = new client.Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percent',
});
const memoryUsageGauge = new client.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage of the Node.js process in bytes',
});

client.collectDefaultMetrics({ register });
register.registerMetric(requestCounter);
register.registerMetric(responseTimeHistogram);
register.registerMetric(cpuUsageGauge);
register.registerMetric(memoryUsageGauge);

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

  // Middleware for prometheus metrics
  app.use((req: Request, res: Response, next: NextFunction) => {
    const end = responseTimeHistogram.startTimer();

    res.on('finish', () => {
      end({ method: req.method, route: req.path, status: res.statusCode.toString() });
      requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode.toString() });
    });

    next();
  });

  let prevCpuUsage = process.cpuUsage();
  let prevHrTime = process.hrtime();
  setInterval(() => {
    const currCpuUsage = process.cpuUsage(prevCpuUsage); // delta in µs
    const currHrTime = process.hrtime(prevHrTime); // delta in [seconds, nanoseconds]

    prevCpuUsage = process.cpuUsage();
    prevHrTime = process.hrtime();

    const elapsedHrTimeSeconds = currHrTime[0] + currHrTime[1] / 1e9;
    const totalCpuMicros = currCpuUsage.user + currCpuUsage.system;

    const cpuPercent = (totalCpuMicros / 1e6 / elapsedHrTimeSeconds) * 100;
    cpuUsageGauge.set(cpuPercent);

    const memoryUsage = process.memoryUsage();
    memoryUsageGauge.set(memoryUsage.rss);
  }, 5000);

  try {
    await app.listen(port, host);
    logger.log(`Server is running at http://${host}:${port}`);
    logger.log(`Database connected at ${databaseUrl}`);
  } catch (error) {
    logger.error('Error starting the application', error);
  }
}


dotenv.config({ path: './.env' });
bootstrap().catch((error) => Logger.error('Error during application startup', error));

const logger = new Logger('Main');
