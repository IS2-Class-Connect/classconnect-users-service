import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

const mockUserRepository = {
  create: jest.fn(),
  setLocation: jest.fn(),
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

      await expect(userService.setLocation(userId, latitude, longitude)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userId, latitude, longitude);
    });

    it('should throw InternalServerErrorException if there is an internal server error', async () => {
      const userId = 1;
      const latitude = 34.6037;
      const longitude = 58.3816;

      mockUserRepository.setLocation.mockRejectedValue(new InternalServerErrorException('Internal server error'));

      await expect(userService.setLocation(userId, latitude, longitude)).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userId, latitude, longitude);
    });
  });
});
