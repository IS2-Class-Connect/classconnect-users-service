import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
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
  @Patch(':id/location')
  async updateLocation(
    @Param('id') userId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<User> {
    return await this.userService.setLocation(Number(userId), latitude, longitude);
  }
}
