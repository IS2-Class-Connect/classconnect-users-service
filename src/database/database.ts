import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IRepository } from './interface/database.interface';
import { User } from '../models/user.model';

@Injectable()
export class Database implements IRepository<User> {
  constructor(private prisma: PrismaService) {}

  async create(data: User): Promise<User> {
    const { ...userData } = data;
    return this.prisma.prisma.user.create({
      data: userData,
    });
  }

}
