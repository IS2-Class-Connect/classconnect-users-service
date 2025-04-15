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

  @Get(':id')
  async getById(@Param('id') userId: string): Promise<User> {
    const user = await this.userService.findById(Number(userId));
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  /* Update the location of a user.*/
  @Patch(':id/location')
  async updateLocation(
    @Param('id') userId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<User> {
    return await this.userService.setLocation(Number(userId), latitude, longitude);
  }

    /* Update the email of a user. */
  @Patch(':id/email')
  async updateEmail(
    @Param('id') userId: string,
    @Body('email') newEmail: string,
  ): Promise<User> {
    return await this.userService.setEmail(Number(userId), newEmail);
  }

  /* Increment the number of failed login attempts for a user. */
  @Patch(':id/failed-attempts')
  async increaseFailedAttempts(@Param('id') userId: string): Promise<User> {
    return await this.userService.increaseFailedAttempts(Number(userId));
  }

  /* Check if a user's account is locked. */
  @Get(':id/check-lock-status')
  async checkLockStatus(
    @Param('id') userId: string,
  ): Promise<{ message: string; isLocked: number }> {
    try {
      const isLocked = await this.userService.isAccountLocked(Number(userId));

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
