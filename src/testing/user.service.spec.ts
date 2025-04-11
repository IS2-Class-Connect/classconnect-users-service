import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';

const mockUserRepository = {
  create: jest.fn(),
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
      location: null,
    };

    mockUserRepository.create.mockResolvedValue(userData);

    const result = await userService.create(userData);

    expect(result).toEqual(userData);
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });
});
