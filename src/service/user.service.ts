import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IService } from './interface/service.interface';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';

/**
 * UserService handles the business logic for user operations.
 * It delegates data persistence to the UserRepository.
 */
const ERROR_USER = 'User not found';
const ERROR_LOCKED_ACCOUNT =
  'Account is locked. Please try again later or contact support to unblock it. ';
const LOCK_DURATION = 240 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const TEN_MINUTES = 600000;

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
   * Retrieves a user by their ID.
   */
  async findById(userId: number): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }
  /**
   * Sets the location for a user.
   */
  async setLocation(userId: number, latitude: number, longitude: number): Promise<User> {
    return this.userRepository.setLocation(userId, latitude, longitude);
  }

  /**
   * Updates the email for a user.
   */
  async setEmail(userId: number, newEmail: string): Promise<User> {
    return this.userRepository.setEmail(userId, newEmail);
  }

  /**
 * Updates the name of a user.
 */
async setName(userId: number, newName: string): Promise<User> {
  return this.userRepository.setName(userId, newName);
}

  /**
   * Increments the failed login attempts for a user.
   * If the user exceeds a certain number of failed attempts within a short period (10 minutes), their account will be locked.
   */
  async increaseFailedAttempts(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_USER);
    }

    const currentTime = new Date().getTime();

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ForbiddenException(ERROR_LOCKED_ACCOUNT);
    }

    const tenMinutesAgo = currentTime - TEN_MINUTES;
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

    return this.userRepository.save(user);
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
