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
import { ERROR_SERVER, ERROR_USER } from '../constants/error.constants';

const UNIQUE_CONSTRAINT_FAILED = 'P2002';
const ERROR_EMAIL = 'Email already exists';
const ERROR_UUID = 'UUID already exists';

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
          const target = (error.meta?.target as string[]) || [];
          let errorMessage = "";
          if (target.includes('email')) {
            errorMessage = ERROR_EMAIL;
          } else if (target.includes('uuid')) {
            errorMessage = ERROR_UUID;
          }
          throw new ConflictException(errorMessage);
        }
      }
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

  // Check if the user's account is locked
  async isAccountLocked(userUuid: string): Promise<boolean> {
    const user = await this.findById(userUuid);

    if (!user) {
      throw new NotFoundException(ERROR_USER);
    }

    return user.accountLocked;
  }

  // Find a user by ID
  async findById(userUuid: string): Promise<User | null> {
    return await this.prisma.prisma.user.findUnique({ where: { uuid: userUuid } });
  }
  // Save method to update the user in the database
  async save(user: User): Promise<User> {
    try {
      return await this.prisma.prisma.user.update({
        where: { uuid: user.uuid },
        data: {
          failedAttempts: user.failedAttempts,
          accountLocked: user.accountLocked,
          lockUntil: user.lockUntil,
          lastFailedAt: user.lastFailedAt,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

  /**
   * Updates the latitude and longitude of an existing user.
   * Throws NotFoundException if the user does not exist.
   */
  async setLocation(userUuid: string, latitude: number, longitude: number): Promise<User> {
    try {
      const user = await this.findById(userUuid);

      if (!user) {
        throw new NotFoundException(ERROR_USER);
      }

      return await this.prisma.prisma.user.update({
        where: { uuid: userUuid },
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
