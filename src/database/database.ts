import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
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
      console.log('Creating user with data:', userData);
      return await this.prisma.prisma.user.create({
        data: userData,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        logger.error(
          `Known Prisma Client error with code ${error.code}. See Prisma error documentation https://www.prisma.io/docs/orm/reference/error-reference for details`,
        );
        if (error.code === UNIQUE_CONSTRAINT_FAILED) {
          const target = (error.meta?.target as string[]) || [];
          let errorMessage = '';
          if (target.includes('email')) {
            errorMessage = ERROR_EMAIL;
          } else if (target.includes('uuid')) {
            errorMessage = ERROR_UUID;
          }
          throw new ConflictException(errorMessage);
        }
      }
      logger.error('An unexpected error has ocurred');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

  // Check if the user's account is locked
  async getAccountLockStatus(userUuid: string): Promise<boolean> {
    const user = await this.findByUuid(userUuid);

    if (!user) {
      logger.error(`User ${userUuid} not found`);
      throw new NotFoundException(ERROR_USER);
    }

    return user.accountLocked;
  }

  // Find a user by uuid
  async findByUuid(userUuid: string): Promise<User | null> {
    return await this.prisma.prisma.user.findUnique({ where: { uuid: userUuid } });
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.prisma.user.findUnique({ where: { email: email } });
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
      logger.debug('An unexpected error has ocurred');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

  /**
   * Updates the latitude and longitude of an existing user.
   * Throws NotFoundException if the user does not exist.
   */
  async setLocation(userUuid: string, latitude: number, longitude: number): Promise<User> {
    try {
      const user = await this.findByUuid(userUuid);

      if (!user) {
        throw new NotFoundException(ERROR_USER);
      }

      return await this.prisma.prisma.user.update({
        where: { uuid: userUuid },
        data: { latitude, longitude },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        logger.error(`User ${userUuid} not found`);
        throw error;
      }

      logger.error('An unexpected error has ocurred');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
  /**
   * Updates the email of an existing user.
   * Throws NotFoundException if the user does not exist.
   */
  async setEmail(userUuid: string, newEmail: string): Promise<User> {
  try {
    const user = await this.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException(ERROR_USER);
    }

    return await this.prisma.prisma.user.update({
      where: { uuid: userUuid },
      data: { email: newEmail},

    });
  } catch (error) {
    if (error instanceof NotFoundException) {
      logger.error(`User ${userUuid} not found`);
      throw error;
    }

    logger.error('An unexpected error has ocurred');
    throw new InternalServerErrorException(ERROR_SERVER);
  }
}

  /**
   * Updates the name of an existing user.
   * Throws NotFoundException if the user does not exist.
   */
  async setName(userUuid: string, newName: string): Promise<User> { 
    try {
      const user = await this.findByUuid(userUuid);
  
      if (!user) {
        throw new NotFoundException(ERROR_USER);
      }
  
      return await this.prisma.prisma.user.update({
        where: { uuid: userUuid },
        data: { name: newName},
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        logger.error(`User ${userUuid} not found`);
        throw error;
      }
  
      logger.error('An unexpected error has ocurred');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
}

const logger = new Logger(UserRepository.name);
