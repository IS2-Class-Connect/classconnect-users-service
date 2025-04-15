import { Controller, Post, Body, Patch, Get, Param, NotFoundException } from '@nestjs/common';
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
    return await this.userService.create(body);
  }

  /* Update the location of a user.*/
  @Patch(':uuid/location')
  async updateLocation(
    @Param('uuid') userUuid: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<User> {
    return await this.userService.setLocation(userUuid, latitude, longitude);
  }

  /* Increment the number of failed login attempts for a user. */
  @Patch(':uuid/failed-attempts')
  async increaseFailedAttempts(@Param('uuid') userUuid: string): Promise<User> {
    return await this.userService.increaseFailedAttempts(userUuid);
  }

  /* Check if a user's account is locked. */
  @Get(':uuid/check-lock-status')
  async checkLockStatus(
    @Param('uuid') userUuid: string,
  ): Promise<{ message: string; isLocked: number }> {
    try {
      const isLocked = await this.userService.isAccountLocked(userUuid);

      return {
        message: isLocked ? 'Account is locked' : 'Account is not locked',
        isLocked: isLocked ? 1 : 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          message: 'User not found',
          isLocked: -1,
        };
      }
      return {
        message: 'Error checking lock status',
        isLocked: -1,
      };
    }
  }
}
