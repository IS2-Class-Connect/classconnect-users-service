import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IService } from './interface/service.interface';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';
import { ERROR_SERVER, ERROR_USER } from '../constants/error.constants';

/**
 * UserService handles the business logic for user operations.
 * It delegates data persistence to the UserRepository.
 */
const ERROR_LOCKED_ACCOUNT =
  'Account is locked. Please try again later or contact support to unblock it. ';
const LOCK_DURATION = 240 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class UserService implements IService<User> {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user.
   */
  async create(data: User): Promise<User> {
    return this.userRepository.create(data);
  }

  /**
   * Sets the location for a user.
   */
  async setLocation(userUuid: string, latitude: number, longitude: number): Promise<User> {
    return this.userRepository.setLocation(userUuid, latitude, longitude);
  }

  /**
   * Increments the failed login attempts for a user.
   * If the user exceeds a certain number of failed attempts within a short period (10 minutes), their account will be locked.
   */
  async increaseFailedAttempts(email: string): Promise<User> {
    let user: User | null;

    try {
      logger.debug(`Finding user ${email}`);
      user = await this.userRepository.findByEmail(email);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unexpected error has ocurred.');
      throw new InternalServerErrorException(ERROR_SERVER);
    }

    if (!user) {
      logger.error(`User ${email} not found`);
      throw new NotFoundException(ERROR_USER);
    }

    const currentTime = Date.now();

    if (user.lockUntil && user.lockUntil > new Date()) {
      logger.debug('Account is locked');
      throw new ForbiddenException(ERROR_LOCKED_ACCOUNT);
    }

    const tenMinutesAgo = currentTime - 10 * 60 * 1000;

    if (user.lastFailedAt && user.lastFailedAt.getTime() > tenMinutesAgo) {
      user.failedAttempts += 1;
    } else {
      user.failedAttempts = 1;
    }

    user.lastFailedAt = new Date();

    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(currentTime + LOCK_DURATION);
      user.accountLocked = true;
    }else{
      user.accountLocked = false;
    }

    try {
      return await this.userRepository.save(user);
    } catch (error) {
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
  async getAccountLockStatus(email: string): Promise<{ accountLocked: boolean, lockUntil: Date | null }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.error(`User ${email} not found`);
      throw new NotFoundException(ERROR_USER);
    }
    const { accountLocked, lockUntil } = this.evaluateLockStatus(user);
    return {
      accountLocked:accountLocked,
      lockUntil: lockUntil
    }  }
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

}

const logger = new Logger(UserService.name);
