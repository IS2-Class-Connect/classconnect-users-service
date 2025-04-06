import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../models/user.model';

@Injectable()
export class Database {
  constructor(private prisma: PrismaService) {}
  async createUser(data: User): Promise<User> {
    const { ...userData } = data;
    return await this.prisma.prisma.user.create({
      data: userData,
    });
  }
}
