import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { UserRepository } from '../database/database';
import { User } from '../models/user.model';
import {
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
const UNIQUE_CONSTRAINT_FAILED = 'P2002';
const ERROR_EMAIL = 'Email already exists';
const ERROR_UUID = 'UUID already exists';
const ERROR_SERVER = 'Unexpected error';
import { ConflictException } from '@nestjs/common'; 

const mockUserRepository = {
  create: jest.fn(),
  setLocation: jest.fn(),
  findByUuid: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  updateProfileInfo: jest.fn(),
  findAll: jest.fn(),
  setBlockStatus: jest.fn(),
  setPushToken: jest.fn(),
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
    accountLockedByAdmins: false,
    pushToken: null,
    pushTaskAssignment: true,
    pushMessageReceived: true,
    pushDeadlineReminder: true,
    emailEnrollment: true,
    emailAssistantAssignment: true,
  };

  describe('create', () => {
    it('should create a user', async () => {
      mockUserRepository.create.mockResolvedValue(userData);
  
      const result = await userService.create(userData);
  
      expect(result).toEqual(userData);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });
    it('should throw ConflictException if email is duplicated', async () => {
      const prismaEmailError = {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: 'mock',
      } as unknown as PrismaClientKnownRequestError;
    
      mockUserRepository.create.mockRejectedValue(prismaEmailError);
    
      await expect(userService.create(userData)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
    
    it('should throw ConflictException if uuid is duplicated', async () => {
      const prismaUuidError = {
        code: 'P2002',
        meta: { target: ['uuid'] },
        clientVersion: 'mock',
      } as unknown as PrismaClientKnownRequestError;
    
      mockUserRepository.create.mockRejectedValue(prismaUuidError);
    
      await expect(userService.create(userData)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
    
  
    it('should throw InternalServerErrorException for other errors', async () => {
      const genericError = new Error('Something went wrong');
  
      mockUserRepository.create.mockRejectedValue(genericError);
  
      await expect(userService.create(userData)).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
  });
  

  describe('setLocation', () => {
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';
    const latitude = -34.6037;
    const longitude = -58.3816;
  
  
    it('should update and return user location successfully', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(userData);
      mockUserRepository.setLocation.mockResolvedValue({ ...userData, latitude, longitude });
  
      const result = await userService.setLocation(userUuid, latitude, longitude);
  
      expect(result.latitude).toBe(latitude);
      expect(result.longitude).toBe(longitude);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userUuid, latitude, longitude);
    });
  
    it('should throw InternalServerErrorException on repository error', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(userData);
      mockUserRepository.setLocation.mockRejectedValue(new Error('DB error'));
  
      await expect(userService.setLocation(userUuid, latitude, longitude)).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
      expect(mockUserRepository.setLocation).toHaveBeenCalledWith(userUuid, latitude, longitude);
    });
  });
  
  describe('increaseFailedAttempts', () => {

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
    });

    it('should throw ForbiddenException if account is locked', async () => {
      const lockedUser = {
        ...userData,
        lockUntil: new Date(Date.now() + 5 * 60 * 1000),
      };

      mockUserRepository.findByEmail.mockResolvedValue(lockedUser);

      await expect(userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000")).rejects.toThrow(ForbiddenException);
    });

    it('should reset failedAttempts if lastFailedAt was more than 10 minutes ago', async () => {
      const oldFailUser = {
        ...userData,
        failedAttempts: 3,
        lastFailedAt: new Date(Date.now() - 11 * 60 * 1000),
      };

      mockUserRepository.findByEmail.mockResolvedValue(oldFailUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000");

      expect(result.failedAttempts).toBe(1);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should increment failedAttempts if within 10 minutes', async () => {
      const recentFailUser = {
        ...userData,
        failedAttempts: 2,
        lastFailedAt: new Date(Date.now() - 5 * 60 * 1000),
      };

      mockUserRepository.findByEmail.mockResolvedValue(recentFailUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await userService.increaseFailedAttempts("123e4567-e89b-12d3-a456-426614174000");

      expect(result.failedAttempts).toBe(3);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should lock the account if failedAttempts exceed max allowed', async () => {
      const userNearLimit = {
        ...userData,
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

    it('should return true if the account is locked', async () => {
      const date = new Date(Date.now() + 10 * 60 * 1000);
      mockUserRepository.findByEmail.mockResolvedValue({ ...userData, accountLocked: true, lockUntil: date });

      const result = await userService.getAccountLockStatus("user@gmail.com");
      expect(result).toStrictEqual({"accountLocked": true, "lockUntil": date});
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("user@gmail.com");
    });

    it('should return false if the account is not locked', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ ...userData, accountLocked: false,lockUntil: null });

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
        ...userData,
        accountLocked: true,
        lockUntil: pastDate,
      });
    
      const result = await userService.getAccountLockStatus("user@gmail.com");
    
      expect(result).toStrictEqual({ accountLocked: false, lockUntil: null });
    });
    
  });

  describe('findByUuid', () => {
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should return the user if found', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(userData);
  
      const result = await userService.findByUuid(userUuid);
  
      expect(result).toEqual(userData);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
    });
  
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(null);
  
      await expect(userService.findByUuid(userUuid)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
    });
  });

  describe('updateProfileInfo', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const updates = { name: 'Updated Name', description: 'New description' };
    const updatedUser: User = {
      uuid,
      name: updates.name,
      description: updates.description,
      email: 'user@gmail.com',
      urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
      provider: 'google.com',
      latitude: null,
      longitude: null,
      failedAttempts: 0,
      accountLocked: false,
      lastFailedAt: null,
      lockUntil: null,
      accountLockedByAdmins: false,
      pushToken: null,
      pushTaskAssignment: true,
      pushMessageReceived: true,
      pushDeadlineReminder: true,
      emailEnrollment: true,
      emailAssistantAssignment: true,
    };
  
    it('should update the user profile info and return the updated user', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(updatedUser); 
      mockUserRepository.updateProfileInfo = jest.fn().mockResolvedValue(updatedUser);
  
      const result = await userService.updateProfileInfo(uuid, updates);
  
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(uuid);
      expect(mockUserRepository.updateProfileInfo).toHaveBeenCalledWith(uuid, updates);
    });
  
    it('should throw InternalServerErrorException if update fails', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(updatedUser);
      const internalError = new InternalServerErrorException('Internal server error');
      mockUserRepository.updateProfileInfo.mockRejectedValue(internalError);
    
      await expect(userService.updateProfileInfo(uuid, updates)).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(uuid);
      expect(mockUserRepository.updateProfileInfo).toHaveBeenCalledWith(uuid, updates);
    });
    
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(null);
    
      await expect(userService.updateProfileInfo(uuid, updates)).rejects.toThrow(NotFoundException);
    });        
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const users: User[] = [userData];
  
      mockUserRepository.findAll = jest.fn().mockResolvedValue(users);
  
      const result = await userService.getAllUsers();
  
      expect(result).toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  
    it('should throw InternalServerErrorException when repository fails', async () => {
      mockUserRepository.findAll = jest.fn().mockRejectedValue(new InternalServerErrorException('Internal server error'));
  
      await expect(userService.getAllUsers()).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
    });
  describe('setBlockStatus', () => {
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should set block status and return the updated user', async () => {
      const updatedUser = { ...userData, accountLockedByAdmins: true };
      mockUserRepository.findByUuid.mockResolvedValue(userData);
      mockUserRepository.setBlockStatus = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.setBlockStatus(userUuid, true);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
      expect(mockUserRepository.setBlockStatus).toHaveBeenCalledWith(userUuid, true);
    });

    it('should throw InternalServerErrorException if repository throws', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(userData);
      mockUserRepository.setBlockStatus = jest.fn().mockRejectedValue(new Error('DB error'));

      await expect(userService.setBlockStatus(userUuid, true)).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
      expect(mockUserRepository.setBlockStatus).toHaveBeenCalledWith(userUuid, true);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(null);

      await expect(userService.setBlockStatus(userUuid, true)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(userUuid);
    });
  });

  describe('setPushToken', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const updates = { pushToken: 'push-token' };
    const updatedUser: User = { ...userData, pushToken: updates.pushToken };
    
    it('should update push token for user', async () => {
      mockUserRepository.findByUuid = jest.fn().mockResolvedValue(userData);
      mockUserRepository.setPushToken = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.setPushToken(uuid, updates.pushToken);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(uuid);
      expect(mockUserRepository.setPushToken).toHaveBeenCalledWith(uuid, updates.pushToken);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByUuid.mockResolvedValue(null);

      await expect(userService.setPushToken(uuid, updates.pushToken)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByUuid).toHaveBeenCalledWith(uuid);
    })
  });
});
