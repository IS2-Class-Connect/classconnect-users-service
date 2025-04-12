import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IRepository } from './interface/database.interface';
import { User } from '../models/user.model';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const UNIQUE_CONSTRAINT_FAILED = 'P2002';
const ERROR_EMAIL = 'Email already exists';
const ERROR_SERVER = 'Internal server error';
const ERROR_USER = 'User not found';

/**
 * Handles database operations related to users using Prisma.
 */
@Injectable()
export class UserRepository implements IRepository<User> {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new user in the database.
   * Throws ConflictException if the email is already taken.
   */
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


  // Find a user by ID
  async findById(userId:number):Promise<User | null>
  {
    return await this.prisma.prisma.user.findUnique({ where: { id: userId } });

  }
    // Save method to update the user in the database
    async save(user: User): Promise<User> {
      return this.prisma.prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: user.failedAttempts,
          accountLocked: user.accountLocked,
          lockUntil: user.lockUntil,
          lastFailedAt: user.lastFailedAt,
        },
      });
    }
    

  /**
   * Updates the latitude and longitude of an existing user.
   * Throws NotFoundException if the user does not exist.
   */
  async setLocation(userId: number, latitude: number, longitude: number): Promise<User> {
    try {
      const user = await this.findById(userId);

      if (!user) {
        throw new NotFoundException(ERROR_USER);
      }

      return await this.prisma.prisma.user.update({
        where: { id: userId },
        data: { latitude, longitude },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
}
