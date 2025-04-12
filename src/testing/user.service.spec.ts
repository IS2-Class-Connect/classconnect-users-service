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
  findById: jest.fn(),
  save: jest.fn(),
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
      id: 1,
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
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;
      const updatedUser: User = {
        id: userId,
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

      const result = await userService.setLocation(userId, latitude, longitude);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userId, latitude, longitude);
      expect(mockUserRepository.setLocation).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;

      mockUserRepository.setLocation.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.setLocation(userId, latitude, longitude)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userId, latitude, longitude);
    });

    it('should throw InternalServerErrorException if there is an internal server error', async () => {
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;

      mockUserRepository.setLocation.mockRejectedValue(
        new InternalServerErrorException('Internal server error'),
      );

      await expect(userService.setLocation(userId, latitude, longitude)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userId, latitude, longitude);
    });
  });

  describe('increaseFailedAttempts', () => {
    const baseUser: User = {
      id: 1,
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
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.increaseFailedAttempts(1)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException if account is locked', async () => {
      const lockedUser = {
        ...baseUser,
        lockUntil: new Date(Date.now() + 5 * 60 * 1000),
      };

      mockUserRepository.findById.mockResolvedValue(lockedUser);

      await expect(userService.increaseFailedAttempts(1)).rejects.toThrow(ForbiddenException);
    });

    it('should reset failedAttempts if lastFailedAt was more than 10 minutes ago', async () => {
      const oldFailUser = {
        ...baseUser,
        failedAttempts: 3,
        lastFailedAt: new Date(Date.now() - 11 * 60 * 1000),
      };

      const expectedUser = {
        ...oldFailUser,
        failedAttempts: 0,
        lastFailedAt: expect.any(Date),
      };

      mockUserRepository.findById.mockResolvedValue(oldFailUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts(1);

      expect(result.failedAttempts).toBe(0);
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

      mockUserRepository.findById.mockResolvedValue(recentFailUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts(1);

      expect(result.failedAttempts).toBe(3);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should lock the account if failedAttempts exceed max allowed', async () => {
      const userNearLimit = {
        ...baseUser,
        failedAttempts: 5,
        lastFailedAt: new Date(Date.now() - 1 * 60 * 1000),
      };

      mockUserRepository.findById.mockResolvedValue(userNearLimit);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts(1);

      expect(result.lockUntil).toBeInstanceOf(Date);
      expect(result.failedAttempts).toBeGreaterThanOrEqual(5);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
  describe('isAccountLocked', () => {
    const mockUser: User = {
      id: 1,
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
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, accountLocked: true });

      const result = await userService.isAccountLocked(1);
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return false if the account is not locked', async () => {
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, accountLocked: false });

      const result = await userService.isAccountLocked(1);
      expect(result).toBe(false);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.isAccountLocked(1)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });
  });
});
