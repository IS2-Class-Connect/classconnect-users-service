import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { UserModule } from '../modules/user.module';
import { ConfigModule } from '@nestjs/config';

jest.mock('../../prisma/prisma.service');

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  it('should import UserModule', async () => {
    const userModule = appModule.get(UserModule);
    expect(userModule).toBeDefined();
  });

  it('should provide PrismaService', async () => {
    const prismaService = appModule.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should load ConfigModule globally', () => {
    const configModule = appModule.get(ConfigModule);
    expect(configModule).toBeDefined();
  });
});
