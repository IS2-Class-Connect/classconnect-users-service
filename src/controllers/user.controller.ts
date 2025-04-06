import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: User) {
    return await this.userService.createUser(body);
  }
}
