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
        },
      };
  
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserRepository,
          { provide: PrismaService, useValue: { prisma: prismaMock } },
        ],
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
            email: "user@gmail.com",
            urlProfilePhoto: "https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg",
            provider: "google.com",
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
            email: "user@gmail.com",
            urlProfilePhoto: "https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg",
            provider: "google.com",
          };
  
        prismaService.prisma.user.create = jest.fn().mockRejectedValue(new Error('Failed to create user'));
  
        await expect(userRepository.create(userData)).rejects.toThrowError('Failed to create user');
      });
    });
  });