import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';
import {
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';

const mockUserRepository = {
  create: jest.fn(),
  setLocation: jest.fn(),
  findByUuid: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  setEmail: jest.fn(),
  setName: jest.fn(),
};

const user: User = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Username',
  email: 'user@gmail.com',
  urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
  provider: 'google.com',
  latitude: null,
  longitude: null,
  failedAttempts: 0,
  accountLocked: false,
  lastFailedAt: null,
  lockUntil: null,
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: UserRepository, useValue: mockUserRepository }],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should create a user', async () => {
    const userData: User = {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: 'Username',
      email: 'user@gmail.com',
      urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
      provider: 'google.com',
      latitude: null,
      longitude: null,
      failedAttempts: 0,
      accountLocked: false,
      lastFailedAt: null,
      lockUntil: null,
    };

    mockUserRepository.create.mockResolvedValue(userData);

    const result = await userService.create(userData);

    expect(result).toEqual(userData);
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  describe('setLocation', () => {
    it('should update the user location if user exists', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174000";
      const latitude = 34.6037;
      const longitude = 58.3816;
      const updatedUser: User = {
        uuid: userUuid,
        name: 'Username',
        email: 'user@gmail.com',
        urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
        provider: 'google.com',
        latitude,
        longitude,
        failedAttempts: 0,
        accountLocked: false,
        lastFailedAt: null,
        lockUntil: null,
      };

      mockUserRepository.setLocation.mockResolvedValue(updatedUser);

      const result = await userService.setLocation(userUuid, latitude, longitude);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userUuid, latitude, longitude);
      expect(mockUserRepository.setLocation).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174000";
      const latitude = 34.6037;
      const longitude = 58.3816;

      mockUserRepository.setLocation.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.setLocation(userUuid, latitude, longitude)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userUuid, latitude, longitude);
    });

    it('should throw InternalServerErrorException if there is an internal server error', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174000";
      const latitude = 34.6037;
      const longitude = 58.3816;

      mockUserRepository.setLocation.mockRejectedValue(
        new InternalServerErrorException('Internal server error'),
      );

      await expect(userService.setLocation(userUuid, latitude, longitude)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userUuid, latitude, longitude);
    });
  });

  describe('increaseFailedAttempts', () => {
    const baseUser: User = {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: 'Username',
      email: 'user@gmail.com',
      urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
      provider: 'google.com',
      latitude: null,
      longitude: null,
      failedAttempts: 0,
      accountLocked: false,
      lastFailedAt: null,
      lockUntil: null,
    };

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
    });

    it('should throw ForbiddenException if account is locked', async () => {
      const lockedUser = {
        ...baseUser,
        lockUntil: new Date(Date.now() + 5 * 60 * 1000),
      };

      mockUserRepository.findByEmail.mockResolvedValue(lockedUser);

      await expect(userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(ForbiddenException);
    });

    it('should reset failedAttempts if lastFailedAt was more than 10 minutes ago', async () => {
      const oldFailUser = {
        ...baseUser,
        failedAttempts: 3,
        lastFailedAt: new Date(Date.now() - 11 * 60 * 1000),
      };

      const expectedUser = {
        ...oldFailUser,
        failedAttempts: 1,
        lastFailedAt: expect.any(Date),
      };

      mockUserRepository.findByEmail.mockResolvedValue(oldFailUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000");

      expect(result.failedAttempts).toBe(1);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should increment failedAttempts if within 10 minutes', async () => {
      const recentFailUser = {
        ...baseUser,
        failedAttempts: 2,
        lastFailedAt: new Date(Date.now() - 5 * 60 * 1000),
      };

      const expectedUser = {
        ...recentFailUser,
        failedAttempts: 3,
        lastFailedAt: expect.any(Date),
      };

      mockUserRepository.findByEmail.mockResolvedValue(recentFailUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000");

      expect(result.failedAttempts).toBe(3);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should lock the account if failedAttempts exceed max allowed', async () => {
      const userNearLimit = {
        ...baseUser,
        failedAttempts: 5,
        lastFailedAt: new Date(Date.now() - 1 * 60 * 1000),
      };

      mockUserRepository.findByEmail.mockResolvedValue(userNearLimit);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000");

      expect(result.lockUntil).toBeInstanceOf(Date);
      expect(result.failedAttempts).toBeGreaterThanOrEqual(5);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if findByUuid throws', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(
        new InternalServerErrorException('Internal server error'),
      );

      await expect(userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if save throws', async () => {
      const userData: User = {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        name: 'Username',
        email: 'user@gmail.com',
        urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 2,
        accountLocked: false,
        lastFailedAt: new Date(Date.now() - 5 * 60 * 1000),
        lockUntil: null,
      };

      mockUserRepository.findByEmail.mockResolvedValue(userData);
      mockUserRepository.save.mockRejectedValue(
        new InternalServerErrorException('Internal server error'),
      );

      await expect(userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAccountLockStatus', () => {
    const mockUser: User = {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: 'Username',
      email: 'user@gmail.com',
      urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
      provider: 'google.com',
      latitude: null,
      longitude: null,
      failedAttempts: 0,
      accountLocked: false,
      lastFailedAt: null,
      lockUntil: null,
    };

    it('should return true if the account is locked', async () => {
      const date = Date.now();
      mockUserRepository.findByEmail.mockResolvedValue({ ...mockUser, accountLocked: true, lockUntil: date });

      const result = await userService.getAccountLockStatus("user@gmail.com");
      expect(result).toStrictEqual({"accountLocked": true, "lockUntil": date});
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("user@gmail.com");
    });

    it('should return false if the account is not locked', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ ...mockUser, accountLocked: false,lockUntil: null });

      const result = await userService.getAccountLockStatus("user@gmail.com");
      expect(result).toStrictEqual({"accountLocked": false, "lockUntil": null});
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("user@gmail.com");
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.getAccountLockStatus("user@gmail.com")).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("user@gmail.com");
    });

    it('should return false and lockUntil null if lock has expired', async () => {
      const pastDate = new Date(Date.now() - 1000); 
    
      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        accountLocked: true,
        lockUntil: pastDate,
      });
    
      const result = await userService.getAccountLockStatus("user@gmail.com");
    
      expect(result).toStrictEqual({ accountLocked: false, lockUntil: null });
    });
    
  });

  describe('findByUuid', () => {
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';
    const updatedUser: User = { ...user, uuid: userUuid };
    it('should return the user if found', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(updatedUser);
  
      const result = await userService.findByUuid(userUuid);
  
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
    });
  
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(null);
  
      await expect(userService.findByUuid(userUuid)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
    });
  });

  describe('setEmail', () => {
    const newEmail = 'newemail@example.com';
    const updatedUser: User = { ...user, email: newEmail };
    it('should update the email of an existing user', async () => {
      
      mockUserRepository.setEmail.mockResolvedValue(updatedUser);

      const result = await userService.setEmail(updatedUser.uuid, newEmail);

      expect(mockUserRepository.setEmail).toHaveBeenCalledWith(updatedUser.uuid, newEmail);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      const userId = 999;
      const newEmail = 'nonexistent@example.com';

      mockUserRepository.setEmail.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.setEmail(updatedUser.uuid, newEmail)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.setEmail).toHaveBeenCalledWith(updatedUser.uuid, newEmail);
    });
  });
  describe('setName', () => {
    const newName = 'Updated Name';
    const updatedUser: User = { ...user, name: newName };
    it('should update the name of an existing user', async () => {

      mockUserRepository.setName.mockResolvedValue(updatedUser);

      const result = await userService.setName(updatedUser.uuid, newName);

      expect(mockUserRepository.setName).toHaveBeenCalledWith(updatedUser.uuid, newName);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      const userId = "999";
      const newName = 'Nonexistent User';

      mockUserRepository.setName.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.setName(userId, newName)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.setName).toHaveBeenCalledWith(userId, newName);
    });
  });
});
