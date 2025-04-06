import { PrismaClient } from '@prisma/client';

export interface IPrismaService {
  prisma: PrismaClient;
}
