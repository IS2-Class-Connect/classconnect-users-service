import { PrismaClient } from '@prisma/client';
/**
 * The IPrismaService interface defines a contract for services that provide a PrismaClient instance to interact with the database.
 */
export interface IPrismaService {
  prisma: PrismaClient;
}
