import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../service/user.service';
import { INestApplication } from '@nestjs/common';
import { User } from '../models/user.model';
import { Express } from 'express';

describe('Test end to end user POST', () => {
  let app: INestApplication;
  const userService = {
    create: jest.fn((user: User) => Promise.resolve(user)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, { provide: UserService, useValue: userService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/user (POST) should create a user', async () => {
    const userData: User = {
      id: 1,
      name: 'Username',
      email: 'user@gmail.com',
      urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
      provider: 'google.com',
      location: null,
    };

    userService.create.mockResolvedValue(userData);

    const response = await request(app.getHttpServer() as Express)
      .post('/user')
      .send(userData)
      .expect(201);

    expect(response.body).toEqual(userData);
  });

  afterAll(async () => {
    await app.close();
  });
});
