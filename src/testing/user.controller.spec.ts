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
    setLocation: jest.fn((userId: string, latitude: number, longitude: number) =>
      Promise.resolve({ ...userData, latitude, longitude }),
    ),
    increaseFailedAttempts: jest.fn((userId: string) =>
      Promise.resolve({ ...userData, failedAttempts: userData.failedAttempts + 1 }),
    ),
    isAccountLocked: jest.fn((userId: string) => Promise.resolve(false)),
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
      userService.isAccountLocked = jest.fn().mockResolvedValue(true);

      const response = await request(app.getHttpServer() as Express)
        .get('/users/1/check-lock-status')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Account is locked',
        isLocked: 1,
      });
    });

    it('should return not locked message and isLocked = 0 when account is not locked', async () => {
      userService.isAccountLocked = jest.fn().mockResolvedValue(false);

      const response = await request(app.getHttpServer() as Express)
        .get('/users/1/check-lock-status')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Account is not locked',
        isLocked: 0,
      });
    });

    it('should return not found message and isLocked = -1 when user does not exist', async () => {
      const NotFoundException = require('@nestjs/common').NotFoundException;
      userService.isAccountLocked = jest.fn().mockRejectedValue(new NotFoundException());

      const response = await request(app.getHttpServer() as Express)
        .get('/users/999/check-lock-status')
        .expect(200); // Still 200 because the controller returns a handled response

      expect(response.body).toEqual({
        message: 'User not found',
        isLocked: -1,
      });
    });

    it('should return error message and isLocked = -1 on unexpected error', async () => {
      userService.isAccountLocked = jest.fn().mockRejectedValue(new Error('Something went wrong'));

      const response = await request(app.getHttpServer() as Express)
        .get('/users/1/check-lock-status')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Error checking lock status',
        isLocked: -1,
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
