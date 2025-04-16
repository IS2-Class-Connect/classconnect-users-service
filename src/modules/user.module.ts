import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../service/user.service';
import { UserRepository } from '../database/database';

/**
 * UserModule is responsible for handling user-related functionality.
 * It wires up the controller, service, repository, and database provider
 * for dependency injection and exposes PrismaService if needed elsewhere.
 */
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
