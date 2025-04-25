import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../database/database';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../models/user.model';

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
        description:"",
      };

      prismaService.prisma.user.create = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.create(userData);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });
  });


  describe('findByUuid', () => {
    it('should return a user if found', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174000";
      const userData: User = {
        uuid: userUuid,
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
        description:"",
      };

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.findByUuid(userUuid);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userUuid } });
    });

    it('should return null if user is not found', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174004";

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await userRepository.findByUuid(userUuid);

      expect(result).toBeNull();
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { uuid: userUuid } });
    });
  });

  describe('setLocation', () => {
    it('should update user location and return the updated user', async () => {
      const userUuid = '123e4567-e89b-12d3-a456-426614174000';
      const latitude = -34.6037;
      const longitude = -58.3816;
  
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
        description: '',
      };
  
      prismaService.prisma.user.update = jest.fn().mockResolvedValue(updatedUser);
  
      const result = await userRepository.setLocation(userUuid, latitude, longitude);
  
      expect(result).toEqual(updatedUser);
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { uuid: userUuid },
        data: { latitude, longitude },
      });
    });
  });
  describe('updateProfileInfo', () => {
    it('should update user profile info and return the updated user', async () => {
      const userUuid = '123e4567-e89b-12d3-a456-426614174000';
  
      const updates = {
        name: 'Updated Name',
        email: 'updated@gmail.com',
        urlProfilePhoto: 'https://example.com/photo.jpg',
        description: 'Updated description',
      };
  
      const updatedUser: User = {
        uuid: userUuid,
        name: updates.name,
        email: updates.email,
        urlProfilePhoto: updates.urlProfilePhoto,
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 0,
        accountLocked: false,
        lastFailedAt: null,
        lockUntil: null,
        description: updates.description,
      };
  
      prismaService.prisma.user.update = jest.fn().mockResolvedValue(updatedUser);
  
      const result = await userRepository.updateProfileInfo(userUuid, updates);
  
      expect(result).toEqual(updatedUser);
      expect(prismaService.prisma.user.update).toHaveBeenCalledWith({
        where: { uuid: userUuid },
        data: updates,
      });
    });
  });
    
  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174000";
      const userEmail= 'user@gmail.com';
      const userData: User = {
        uuid: userUuid,
        name: 'Username',
        email: userEmail,
        urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
        provider: 'google.com',
        latitude: null,
        longitude: null,
        failedAttempts: 0,
        accountLocked: false,
        lastFailedAt: null,
        lockUntil: null,
        description:"",
      };

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(userData);

      const result = await userRepository.findByEmail(userEmail);

      expect(result).toEqual(userData);
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userEmail } });
    });

    it('should return null if user is not found', async () => {
      const userUuid = "123e4567-e89b-12d3-a456-426614174004";
      const userEmail= 'user@gmail.com';

      prismaService.prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await userRepository.findByEmail(userEmail);

      expect(result).toBeNull();
      expect(prismaService.prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userEmail } });
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
        description:"",
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
  });
});
