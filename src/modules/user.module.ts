import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../service/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Database } from '../database/database';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService,Database],
  exports: [PrismaService],
})
export class UserModule {}
