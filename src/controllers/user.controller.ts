import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.model';
import { IController } from './interface/controller.interface';
import { UpdateUserProfileDto } from '../models/user.update.data';
import { UserPublicInfo } from '../models/user.public.info';

/**
 * Handles user-related endpoints such as creation and location updates.
 */
@Controller('users')
export class UserController implements IController<User,UserPublicInfo> {
  constructor(private readonly userService: UserService) {}

  /* Create a new user.*/
  @Post()
  async create(@Body() body: User): Promise<User> {
    logger.log(`Creating new user with body ${body}`);
    return await this.userService.create(body);
  }

  /* Update the location of a user.*/
  @Patch(':uuid/location')
  async updateLocation(
    @Param('uuid') userUuid: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<User> {
    logger.log(
      `Updating user ${userUuid} location with latitude ${latitude} and logitude ${longitude}`,
    );
    return await this.userService.setLocation(userUuid, latitude, longitude);
  }

  /* Increment the number of failed login attempts for a user. */
  @Patch(':email/failed-attempts')
  async increaseFailedAttempts(@Param('email') email: string): Promise<User> {
    logger.log(`Increment the number of user ${email} failed login attempts`);
    return await this.userService.increaseFailedAttempts(email);
  }

  /* Check if a user's account is locked. */
  @Get(':email/check-lock-status')
async checkLockStatus(@Param('email') email: string): Promise<{
  message: string;
  isLocked: number;
  lockedDate: Date | null;
}> {
  logger.log(`Checking user ${email} account lock status`);

  const { accountLocked, lockUntil } =
    await this.userService.getAccountLockStatus(email);

  logger.log(`Checking successful, lock status: ${accountLocked}`);
  return {
    message: accountLocked ? 'Account is locked' : 'Account is not locked',
    isLocked: accountLocked ? 1 : 0,
    lockedDate: lockUntil,
  };
}


  // Returns user details by UUID or throws if not found.
  @Get(':uuid')
  async findByUuid( @Param('uuid') userUuid: string,): Promise<User | null > {
    return await this.userService.findByUuid(userUuid);
  }

// Updates user profile name, email, profile photo URL, and description by UUID.
  @Patch(':uuid')
  async updateProfileInfo(
    @Param('uuid') userUuid: string,
    @Body() body: UpdateUserProfileDto,
  ): Promise<User> {
    logger.log(`Updating user ${userUuid} with: ${JSON.stringify(body)}`);
    return await this.userService.updateProfileInfo(userUuid, body);
  }
  
//Retrieve all users.
  @Get()
  async getAllUsers(): Promise<UserPublicInfo[]> {
    return this.userService.getAllUsers();
  }
}


const logger = new Logger(UserController.name);
