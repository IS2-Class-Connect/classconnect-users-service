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
    setLocation: jest.fn((userId: number, latitude: number, longitude: number) =>
      Promise.resolve({ ...userData, latitude, longitude })
    ), 
  };

  const userData: User = {
    id: 1,
    name: 'Username',
    email: 'user@gmail.com',
    urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
    provider: 'google.com',
    latitude: null,
    longitude: null,
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

  afterAll(async () => {
    await app.close();
  });
});
