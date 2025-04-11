import { Injectable } from '@nestjs/common';
import { IService } from './interface/service.interface';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';

@Injectable()
export class UserService implements IService<User> {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: User): Promise<User> {
    return this.userRepository.create(data);
  }

  async setLocation(userId: number, latitude: number, longitude: number): Promise<User> {
    return this.userRepository.setLocation(userId, latitude, longitude);
  }  
}
