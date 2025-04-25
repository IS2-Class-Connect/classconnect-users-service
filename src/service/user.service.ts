import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { IService } from './interface/service.interface';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';
import { ERROR_SERVER, ERROR_USER } from '../constants/error.constants';
import { UpdateUserProfileDto } from '../models/user.update.data';

/**
 * UserService handles the business logic for user operations.
 * It delegates data persistence to the UserRepository.
 */
const ERROR_LOCKED_ACCOUNT =
  'Account is locked. Please try again later or contact support to unblock it. ';
const LOCK_DURATION = 240 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const UNIQUE_CONSTRAINT_FAILED = 'P2002';

@Injectable()
export class UserService implements IService<User> {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user.
   */
  async create(data: User): Promise<User> {
    try {
      return await this.userRepository.create(data);
    } catch (error) {
      if ((error as any).code === UNIQUE_CONSTRAINT_FAILED) {
        const target = (error as any).meta?.target?.[0];
        if (target === 'email' || target === 'uuid') {
          throw new ConflictException(`Duplicated ${target}`);
        }
      }
  
      logger.error('Error while creating user', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
  /**
   * Sets the location for a user.
   */
  async setLocation(userUuid: string, latitude: number, longitude: number): Promise<User> {
    const user = await this.findByUuid(userUuid);
    try {
      return await this.userRepository.setLocation(userUuid, latitude, longitude);
    } catch (error) {
      logger.error('Error setting location', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

  /**
   * Updates user profile.
   */
async updateProfileInfo(uuid: string, updates: UpdateUserProfileDto): Promise<User> {
  const user = await this.findByUuid(uuid); 
  try {
    return await this.userRepository.updateProfileInfo(uuid, updates);
  } catch (error) {
    logger.error('An unexpected error occurred while updating user profile info');
    throw new InternalServerErrorException(ERROR_SERVER);
  }
}

  /**
   * Increments the failed login attempts for a user.
   * If the user exceeds a certain number of failed attempts within a short period (10 minutes), their account will be locked.
   */
  async increaseFailedAttempts(email: string): Promise<User> {
    let user: User | null;

    try {
      user = await this.userRepository.findByEmail(email);
    } catch (error) {
      logger.error('Error fetching user by email', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }

    if (!user) {
      logger.warn(`User with email ${email} not found`);
      throw new NotFoundException(ERROR_USER);
    }

    const currentTime = Date.now();
    const tenMinutesAgo = currentTime - 10 * 60 * 1000;

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ForbiddenException(ERROR_LOCKED_ACCOUNT);
    }

    if (user.lastFailedAt && user.lastFailedAt.getTime() > tenMinutesAgo) {
      user.failedAttempts += 1;
    } else {
      user.failedAttempts = 1;
    }

    user.lastFailedAt = new Date();

    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(currentTime + LOCK_DURATION);
      user.accountLocked = true;
    } else {
      user.accountLocked = false;
    }

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      logger.error('Error saving failed attempts', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }

/**
 * Evaluate lock status
 */
  private evaluateLockStatus(user: User): { accountLocked: boolean; lockUntil: Date | null } {
    const now = Date.now();
    const lockTime = user.lockUntil ? new Date(user.lockUntil).getTime() : null;
    const isLockExpired = lockTime !== null && now > lockTime;
  
    const accountLocked = user.accountLocked && !isLockExpired;
  
    let lockUntil = user.lockUntil;
    if (isLockExpired) {
      lockUntil = null;
    }
  
    return { accountLocked, lockUntil };
  }
  /**
   *  Check if a user is blocked
   */
  async getAccountLockStatus(email: string): Promise<{ accountLocked: boolean; lockUntil: Date | null }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(ERROR_USER);
    }
    const { accountLocked, lockUntil } = this.evaluateLockStatus(user);
    return { accountLocked, lockUntil };
  }

  /**
   *  Returns users data
   */
  async findByUuid(userUuid: string): Promise<User | null> { 
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      logger.error(`User ${userUuid} not found`);
      throw new NotFoundException(ERROR_USER);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return this.userRepository.findAll();
    } catch (error) {
      logger.error('Error getting all users', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
}

const logger = new Logger(UserService.name);
