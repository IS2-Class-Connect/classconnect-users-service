import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.model';
import { IController } from './interface/controller.interface';

/**
 * Handles user-related endpoints such as creation and location updates.
 */
@Controller('users')
export class UserController implements IController<User> {
  constructor(private readonly userService: UserService) {}

  /* Create a new user.*/
  @Post()
  async create(@Body() body: User): Promise<User> {
    logger.log(`Creating new user with body ${body}`);
    return await this.userService.create(body);
  }

  /* Update the location of a user.*/
  @Patch(':uuid/location')
  async updateLocation(
    @Param('uuid') userUuid: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<User> {
    logger.log(
      `Updating user ${userUuid} location with latitude ${latitude} and logitude ${longitude}`,
    );
    return await this.userService.setLocation(userUuid, latitude, longitude);
  }

  /* Increment the number of failed login attempts for a user. */
  @Patch(':email/failed-attempts')
  async increaseFailedAttempts(@Param('email') email: string): Promise<User> {
    logger.log(`Increment the number of user ${email} failed login attempts`);
    return await this.userService.increaseFailedAttempts(email);
  }

  /* Check if a user's account is locked. */
  @Get(':email/check-lock-status')
  async checkLockStatus(
    @Param('email') email: string,
  ): Promise<{ message: string, isLocked: number, lockedDate: Date|null }> {
    logger.log(`Checking user ${email} account lock status`);
    try {
      const { accountLocked, lockUntil } = await this.userService.getAccountLockStatus(email);

      logger.log(`Checking succesfull, lock status: ${accountLocked}`);
      return {
        message: accountLocked ? 'Account is locked' : 'Account is not locked',
        isLocked: accountLocked ? 1 : 0,
        lockedDate: lockUntil,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        logger.error(`User ${email} not found`);
        return {
          message: 'User not found',
          isLocked: -1,
          lockedDate: null,
        };
      }
      logger.error("Unexpected error while trying to check user's account lock status");
      return {
        message: 'Error checking lock status',
        isLocked: -1,
        lockedDate: null,
      };
    }
  }

  @Get(':uuid')
  async findByUuid( @Param('uuid') userUuid: string,): Promise<User> {
    const user = await this.userService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

}

const logger = new Logger(UserController.name);
