import { Injectable } from '@nestjs/common';
import { IPrismaService } from '.././prisma/prisma.interface';
import { IConfig } from './config/config.interface';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: IPrismaService,
    private readonly configService: IConfig,
  ) {}

  async getUsers() {
    return await this.prismaService.prisma.user.findMany();
  }

  getHello(): string {
    return `App running in ${this.configService.environment} on ${this.configService.host}:${this.configService.port}`;
  }
}
