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

      prismaService.prisma.user.create = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.create(userData);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });

    it('should throw an error if creation fails', async () => {
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

      prismaService.prisma.user.create = jest.fn().mockRejectedValue(new Error('Internal server error'));

      await expect(userRepository.create(userData)).rejects.toThrowError('Internal server error');
    });
  });

  it('should throw ConflictException if email already exists', async () => {
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
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;

      const userData: User = {
        id: userId,
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
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { latitude, longitude },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(userRepository.setLocation(userId, latitude, longitude)).rejects.toThrow(NotFoundException);

      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;

      const userData: User = {
        id: userId,
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

      prismaService.prisma.user.update = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(userRepository.setLocation(userId, latitude, longitude)).rejects.toThrow(InternalServerErrorException);

      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { latitude, longitude },
      });
    });
  });
});
