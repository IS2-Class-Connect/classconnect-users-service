import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../modules/user.module';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../service/user.service';
import { UserRepository } from '../database/database';

jest.mock('../../prisma/prisma.service');
jest.mock('../database/database');

describe('UserModule', () => {
  let userModule: TestingModule;
  let userService: UserService;
  let userController: UserController;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    userService = userModule.get<UserService>(UserService);
    userController = userModule.get<UserController>(UserController);
    userRepository = userModule.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userModule).toBeDefined();
    expect(userService).toBeDefined();
    expect(userController).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
