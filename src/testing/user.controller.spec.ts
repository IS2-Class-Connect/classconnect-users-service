import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../service/user.service';
import { INestApplication } from '@nestjs/common';
import { User } from '../models/user.model';
import { Express } from 'express';

describe('UserController', () => {
  let app: INestApplication;
  const userService = {
    create: jest.fn((user: User) => Promise.resolve(user)),
    setLocation: jest.fn((userUuid: string, latitude: number, longitude: number) =>
      Promise.resolve({ ...userData, latitude, longitude }),
    ),
    increaseFailedAttempts: jest.fn((email: string) =>
      Promise.resolve({ ...userData, failedAttempts: userData.failedAttempts + 1 }),
    ),
    getAccountLockStatus: jest.fn((email: string) => Promise.resolve(false)),
    findByUuid: jest.fn((userUuid: string) => Promise.resolve(userData)), 
    updateProfileInfo: jest.fn((uuid: string, updates: Partial<User>) =>
      Promise.resolve({ ...userData, ...updates }),
    ),
    getAllUsers: jest.fn(() => Promise.resolve([userData])),
    setBlockStatus: jest.fn((uuid: string, locked: boolean) =>
      Promise.resolve({ ...userData, accountLocked: locked }),
    ),
  };

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
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, { provide: UserService, useValue: userService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST) should create a user', async () => {
    userService.create.mockResolvedValue(userData);

    const response = await request(app.getHttpServer() as Express)
      .post('/users')
      .send(userData)
      .expect(201);

    expect(response.body).toEqual(userData);
  });

  it('/users/:id/location (PATCH) should update user location', async () => {
    const updatedLocation = { latitude: 40.4168, longitude: -3.7038 };

    userService.setLocation.mockResolvedValue({ ...userData, ...updatedLocation });

    const response = await request(app.getHttpServer() as Express)
      .patch('/users/1/location')
      .send(updatedLocation)
      .expect(200);

    expect(response.body.latitude).toBe(updatedLocation.latitude);
    expect(response.body.longitude).toBe(updatedLocation.longitude);
  });

  it('/users/:id/failed-attempts (PATCH) should increment failed login attempts', async () => {
    const updatedUser = { ...userData, failedAttempts: userData.failedAttempts + 1 };
    userService.increaseFailedAttempts.mockResolvedValue(updatedUser);

    const response = await request(app.getHttpServer() as Express)
      .patch('/users/1/failed-attempts')
      .expect(200);

    expect(response.body.failedAttempts).toBe(updatedUser.failedAttempts);
  });

  describe('/users/:id/check-lock-status (GET)', () => {
    it('should return locked message and isLocked = 1 when account is locked', async () => {
      const date= Date.now()
      userService.getAccountLockStatus = jest.fn().mockResolvedValue( {accountLocked: true,lockUntil: date });

      const response = await request(app.getHttpServer() as Express)
        .get('/users/1/check-lock-status')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Account is locked',
        isLocked: 1,
        lockedDate: date
      });
    });

    it('should return not locked message and isLocked = 0 when account is not locked', async () => {
      userService.getAccountLockStatus = jest.fn().mockResolvedValue( {accountLocked: false,lockUntil: null });

      const response = await request(app.getHttpServer() as Express)
        .get('/users/1/check-lock-status')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Account is not locked',
        isLocked: 0,
        lockedDate: null
      });
    });




  });
  describe('/users/:uuid (GET)', () => {

  it('/users/:uuid (GET) should return user data when found', async () => {
    userService.findByUuid = jest.fn().mockResolvedValue(userData);
  
    const response = await request(app.getHttpServer() as Express)
      .get(`/users/${userData.uuid}`)
      .expect(200);
  
    expect(response.body).toEqual(userData);
  });
  
  it('/users/:uuid (GET) should return 404 when user not found', async () => {
    const NotFoundException = require('@nestjs/common').NotFoundException;
    userService.findByUuid = jest.fn().mockRejectedValue(new NotFoundException('User not found'));
  
    const response = await request(app.getHttpServer() as Express)
      .get('/users/unknown-uuid')
      .expect(404);
  
      expect(response.body).toEqual({
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
});

describe('/users/:uuid (PATCH) - updateProfileInfo', () => {
  const updatedData = {
    name: 'Updated Username',
    email: 'newemail@example.com',
    urlProfilePhoto: 'https://newimage.com/photo.jpg',
    description: 'Updated description',
  };

  const updatedUser = {
    ...userData,
    ...updatedData,
  };

  it('should update user profile and return updated user', async () => {
    userService.updateProfileInfo = jest.fn().mockResolvedValue(updatedUser);

    const response = await request(app.getHttpServer() as Express)
      .patch(`/users/${userData.uuid}`)
      .send(updatedData)
      .expect(200);

    expect(response.body).toEqual(updatedUser);
    expect(userService.updateProfileInfo).toHaveBeenCalledWith(userData.uuid, updatedData);
  });
});

it('/users (GET) should return all users', async () => {
  const users = [userData, { ...userData, uuid: "another-uuid", email: "another@gmail.com" }];
  userService.getAllUsers = jest.fn().mockResolvedValue(users);

  const response = await request(app.getHttpServer() as Express)
    .get('/users')
    .expect(200);

  expect(response.body).toEqual(users);
  expect(userService.getAllUsers).toHaveBeenCalled();
});
  describe('/users/:uuid/lock-status (PATCH)', () => {
    it('should block the user', async () => {
      const locked = true;
      const expectedUser = { ...userData, accountLocked: locked };

      userService.setBlockStatus = jest.fn().mockResolvedValue(expectedUser);

      const response = await request(app.getHttpServer() as Express)
        .patch(`/users/${userData.uuid}/lock-status`)
        .send({ locked })
        .expect(200);

      expect(response.body).toEqual(expectedUser);
      expect(userService.setBlockStatus).toHaveBeenCalledWith(userData.uuid, locked);
    });

    it('should unblock the user', async () => {
      const locked = false;
      const expectedUser = { ...userData, accountLocked: locked };

      userService.setBlockStatus = jest.fn().mockResolvedValue(expectedUser);

      const response = await request(app.getHttpServer() as Express)
        .patch(`/users/${userData.uuid}/lock-status`)
        .send({ locked })
        .expect(200);

      expect(response.body).toEqual(expectedUser);
      expect(userService.setBlockStatus).toHaveBeenCalledWith(userData.uuid, locked);
    });

    it('should return 404 if user not found', async () => {
      const NotFoundException = require('@nestjs/common').NotFoundException;
      userService.setBlockStatus = jest.fn().mockRejectedValue(new NotFoundException('User not found'));

      const response = await request(app.getHttpServer() as Express)
        .patch('/users/non-existent-uuid/lock-status')
        .send({ locked: true })
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      });
    });
  });


  afterAll(async () => {
    await app.close();
  });
});
