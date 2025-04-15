import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../database/database';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../models/user.model';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

jest.mock('../../prisma/prisma.service');

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, { provide: PrismaService, useValue: { prisma: prismaMock } }],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
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

      prismaService.prisma.user.create = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.create(userData);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });

    it('should throw an error if creation fails', async () => {
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

      prismaService.prisma.user.create = jest
        .fn()
        .mockRejectedValue(new InternalServerErrorException('Internal server error'));

      await expect(userRepository.create(userData)).rejects.toThrowError('Internal server error');
    });
  });

  it('should throw ConflictException if email already exists', async () => {
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

    const prismaError = {
      code: 'P2002',
      meta: {
        target: ['email'],
      },
      name: 'PrismaClientKnownRequestError',
    };

    Object.setPrototypeOf(prismaError, PrismaClientKnownRequestError.prototype);

    prismaService.prisma.user.create = jest.fn().mockRejectedValue(prismaError);

    await expect(userRepository.create(userData)).rejects.toThrow(ConflictException);
  });

  describe('setLocation', () => {
    it('should update user location if user exists', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const latitude = 34.6037;
      const longitude = 58.3816;

      const userData: User = {
        uuid: userId,
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

      const updatedUser = { ...userData, latitude, longitude };

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(userData);

      prismaService.prisma.user.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await userRepository.setLocation(userId, latitude, longitude);

      expect(result).toEqual(updatedUser);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { uuid: userId },
        data: { latitude, longitude },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const latitude = 34.6037;
      const longitude = 58.3816;

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(userRepository.setLocation(userId, latitude, longitude)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const latitude = 34.6037;
      const longitude = 58.3816;

      const userData: User = {
        uuid: userId,
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

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(userData);

      prismaService.prisma.user.update = jest.fn().mockRejectedValue(new InternalServerErrorException('Internal server error'));

      await expect(userRepository.setLocation(userId, latitude, longitude)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { uuid: userId },
        data: { latitude, longitude },
      });
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const userData: User = {
        uuid: userId,
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

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.findById(userId);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
    });

    it('should return null if user is not found', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174004";

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await userRepository.findById(userId);

      expect(result).toBeNull();
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
    });
  });

  describe('save', () => {
    it('should update and return the user', async () => {
      const userData: User = {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        name: 'Username',
        email: 'user@gmail.com',
        urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 2,
        accountLocked: true,
        lastFailedAt: new Date(),
        lockUntil: new Date(Date.now() + 15 * 60 * 1000),
      };

      prismaService.prisma.user.update = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.save(userData);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { uuid: userData.uuid },
        data: {
          failedAttempts: userData.failedAttempts,
          accountLocked: userData.accountLocked,
          lockUntil: userData.lockUntil,
          lastFailedAt: userData.lastFailedAt,
        },
      });
    });

    it('should throw an Error if update fails', async () => {
      const userData: User = {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        name: 'Username',
        email: 'user@gmail.com',
        urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 3,
        accountLocked: true,
        lastFailedAt: new Date(),
        lockUntil: new Date(),
      };

      prismaService.prisma.user.update = jest
        .fn()
        .mockRejectedValue(new InternalServerErrorException('Internal server error'));

      await expect(userRepository.save(userData)).rejects.toThrow(InternalServerErrorException);
      await expect(userRepository.save(userData)).rejects.toThrow('Internal server error');
    });
  });
  describe('isAccountLocked', () => {
    it('should return true if account is locked', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const user: User = {
        uuid: userId,
        name: 'Test User',
        email: 'locked@example.com',
        urlProfilePhoto: '',
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 3,
        accountLocked: true,
        lastFailedAt: null,
        lockUntil: null,
      };

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(user);

      const result = await userRepository.isAccountLocked(userId);

      expect(result).toBe(true);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
    });

    it('should return false if account is not locked', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const user: User = {
        uuid: userId,
        name: 'Unlocked User',
        email: 'unlocked@example.com',
        urlProfilePhoto: '',
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 1,
        accountLocked: false,
        lastFailedAt: null,
        lockUntil: null,
      };

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(user);

      const result = await userRepository.isAccountLocked(userId);

      expect(result).toBe(false);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174005";

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(userRepository.isAccountLocked(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userId } });
    });
  });
});
