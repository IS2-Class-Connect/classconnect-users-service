import { Injectable } from '@nestjs/common';
import { IService } from './interface/service.interface';
import { Database } from '../database/database';
import { User } from '../models/user.model';

@Injectable()
export class UserService implements IService<User> {
  constructor(private readonly database: Database) {}

  async create(data: User): Promise<User> {
    return this.database.create(data);
  }
}
