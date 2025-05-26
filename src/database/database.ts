import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IRepository } from './interface/database.interface';
import { User } from '../models/user.model';
import { UpdateUserProfileDto } from '../models/user.update.data';
import { UserPublicInfo } from '../models/user.public.info';

/**
 * Handles database operations related to users using Prisma.
 */
@Injectable()
export class UserRepository implements IRepository<User, UserPublicInfo> {
  constructor(private prisma: PrismaService) { }


  // Creates a new user in the database.
  async create(data: User): Promise<User> {
    return await this.prisma.prisma.user.create({ data });
  }

  // Find a user by uuid
  async findByUuid(userUuid: string): Promise<User | null> {
    return await this.prisma.prisma.user.findUnique({ where: { uuid: userUuid } });
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.prisma.user.findUnique({ where: { email: email } });
  }

  // Save method to update the user in the database
  async save(user: User): Promise<User> {
    return await this.prisma.prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        failedAttempts: user.failedAttempts,
        accountLocked: user.accountLocked,
        lockUntil: user.lockUntil,
        lastFailedAt: user.lastFailedAt,
      },
    });
  }

  // Updates the latitude and longitude of an existing user.
  async setLocation(userUuid: string, latitude: number, longitude: number): Promise<User> {
    return await this.prisma.prisma.user.update({
      where: { uuid: userUuid },
      data: { latitude, longitude },
    });
  }

  // Updates user profile fields.
  async updateProfileInfo(uuid: string, updates: UpdateUserProfileDto): Promise<User> {
    return await this.prisma.prisma.user.update({
      where: { uuid },
      data: updates,
    });
  }

  // Retrieves all users.
  async findAll(): Promise<UserPublicInfo[]> {
    return this.prisma.prisma.user.findMany({
      select: {
        uuid: true,
        name: true,
        email: true,
        urlProfilePhoto: true,
        description: true,
        accountLockedByAdmins: true,
        createdAt: true,
        pushToken: true,
        pushTaskAssignment: true,
        pushMessageReceived: true,
        emailDeadlineReminder: true,
        emailEnrollment: true,
        emailAssistantAssignment: true,
      },
    });
  }

  // Updates the block status of an existing user.
  async setBlockStatus(userUuid: string, blockStatus: boolean): Promise<User> {
    return await this.prisma.prisma.user.update({
      where: { uuid: userUuid },
      data: { accountLockedByAdmins: blockStatus },
    });
  }

  // Updates the push token of an existing user.
  async setPushToken(uuid: string, pushToken: string): Promise<User> {
    return await this.prisma.prisma.user.update({
      where: { uuid: uuid },
      data: { pushToken: pushToken },
    })
  }
}

const logger = new Logger(UserRepository.name);
