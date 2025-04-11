import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.model';
import { IController } from './interface/controller.interface';

@Controller('user')
export class UserController implements IController<User> {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: User): Promise<User> {
    return await this.userService.create(body);
  }

  @Put(':id/location')
  async updateLocation(
    @Param('id') userId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<User> {
    return await this.userService.setLocation(Number(userId), latitude, longitude);
  }
}
