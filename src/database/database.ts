import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IRepository } from './interface/database.interface';
import { User } from '../models/user.model';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const UNIQUE_CONSTRAINT_FAILED = 'P2002';
const ERROR_EMAIL = 'Email already exists';
const ERROR_SERVER = 'Internal server error';

@Injectable()
export class UserRepository implements IRepository<User> {
  constructor(private prisma: PrismaService) {}

  async create(data: User): Promise<User> {
    try {
      const { ...userData } = data;
      return await this.prisma.prisma.user.create({
        data: userData,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === UNIQUE_CONSTRAINT_FAILED) {
          throw new ConflictException(ERROR_EMAIL);
        }
      }
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
}
