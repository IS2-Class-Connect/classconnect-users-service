import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../modules/user.module'; 
import { PrismaService } from '../../prisma/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let newUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    await prisma.prisma.user.deleteMany({
      where: {
        uuid: 'eJwvOiUz6YaFSJz9cKkLMNNtMFg21',
      },
    });
  
    newUser = {
      uuid: 'eJwvOiUz6YaFSJz9cKkLMNNtMFg21',
      email: 'emailUser@gmail.com',
      name: 'Username',
      urlProfilePhoto: 'https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg',
      provider: 'google.com',
    };
  });
  
  afterAll(async () => {
    await prisma.prisma.user.deleteMany({
      where: {
        uuid: 'eJwvOiUz6YaFSJz9cKkLMNNtMFg21',
      },
    });
  
    await app.close();
  });
  it('POST /users - should create a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject(newUser);
  });

  it('PATCH /users/:uuid/location - should update the location of the user', async () => {
    const updatedLocation = { latitude: 40.7128, longitude: -74.0060 }; 

    const response = await request(app.getHttpServer())
      .patch(`/users/${newUser.uuid}/location`)
      .send(updatedLocation)
      .expect(200);

    expect(response.body.latitude).toBe(updatedLocation.latitude);
    expect(response.body.longitude).toBe(updatedLocation.longitude);
  });

  it('PATCH /users/:email/failed-attempts - should increment failed attempts for the user', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${newUser.email}/failed-attempts`)
      .expect(200);

    expect(response.body.failedAttempts).toBeGreaterThan(0);
  });

  it('GET /users/:email/check-lock-status - should check the lock status of the user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${newUser.email}/check-lock-status`)
      .expect(200);

    expect(response.body.message).toBe('Account is not locked');
    expect(response.body.isLocked).toBe(0);
    expect(response.body.lockedDate).toBeNull();
  });

  it('GET /users/:uuid - should get a user by uuid', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${newUser.uuid}`)
      .expect(200);

    expect(response.body).toMatchObject(newUser);
  });

  it('GET /users/:uuid - should return 404 if user not found', async () => {
    const nonExistentUuid = 'non-existent-uuid';
    const response = await request(app.getHttpServer())
      .get(`/users/${nonExistentUuid}`)
      .expect(404);

    expect(response.body.message).toBe('User not found');
  });
});
