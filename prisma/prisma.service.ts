import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPrismaService } from './prisma.interface';

/**
 * PrismaService provides the Prisma client and manages the database connection lifecycle.
 * It connects to the database when the module is initialized and disconnects when the module is destroyed.
 */
@Injectable()
export class PrismaService implements IPrismaService, OnModuleInit {
  private _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }


  get prisma(): PrismaClient {
    return this._prisma;
  }
 
  async onModuleInit() {
    await this._prisma.$connect();
    console.log('Prisma client connected');
  }


  async onModuleDestroy() {
    await this._prisma.$disconnect(); 
    console.log('Prisma client disconnected');
  }
}
