import { Injectable } from '@nestjs/common';
import { IPrismaService } from '.././prisma/prisma.interface';
import { IConfig } from './config/config.interface';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: IPrismaService,
    private readonly configService: IConfig,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

}
