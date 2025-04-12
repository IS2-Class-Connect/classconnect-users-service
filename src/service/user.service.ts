import { Injectable, NotFoundException, ForbiddenException,InternalServerErrorException } from '@nestjs/common';
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
  async setLocation(userId: number, latitude: number, longitude: number): Promise<User> {
    return this.userRepository.setLocation(userId, latitude, longitude);
  }

  /**
   * Increments the failed login attempts for a user.
   * If the user exceeds a certain number of failed attempts within a short period (10 minutes), their account will be locked.
   */
  async increaseFailedAttempts(userId: number): Promise<User> {
    let user: User | null;
  
    try {
      user = await this.userRepository.findById(userId);
    } catch (error) {
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  
    if (!user) {
      throw new NotFoundException(ERROR_USER);
    }
  
    const currentTime = Date.now();
  
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ForbiddenException(ERROR_LOCKED_ACCOUNT);
    }
  
    const tenMinutesAgo = currentTime - 10 * 60 * 1000;
  
    if (user.lastFailedAt && user.lastFailedAt.getTime() > tenMinutesAgo) {
      user.failedAttempts += 1;
    } else {
      user.failedAttempts = 0; 
      user.accountLocked = false;
    }
  
    user.lastFailedAt = new Date();
  
    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(currentTime + LOCK_DURATION);
      user.accountLocked = true;
    }
  
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(ERROR_SERVER);
    }
  }
  
  /**
   *  Check if a user is blocked
   */
  async isAccountLocked(id: number): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_USER);
    }
    return user.accountLocked;
  }
}
