import { Injectable } from '@nestjs/common';
import { Database } from '../database/database';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
  constructor(private database: Database) {}
  createUser(data: User): Promise<User>  {
    return this.database.createUser(data);
  }
}
