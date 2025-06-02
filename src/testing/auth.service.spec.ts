import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload, LoginTicket } from 'google-auth-library';

const mockTicket = (payload?: TokenPayload): Partial<LoginTicket> => ({
  getPayload: () => payload,
});

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(),
    })),
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let oAuthClientMock: { verifyIdToken: jest.Mock };

  beforeAll(() => {
    process.env.CLIENT_ID = 'test-client-id';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    oAuthClientMock = (authService as any).client;
  });

  it('should return user data when token is valid', async () => {
    const mockPayload: TokenPayload = {
      sub: '123456',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/photo.jpg',
      aud: '',
      azp: '',
      email_verified: true,
      exp: 0,
      iat: 0,
      iss: '',
    };

    oAuthClientMock.verifyIdToken.mockResolvedValueOnce(mockTicket(mockPayload));

    const result = await authService.verifyGoogleToken('valid-token');

    expect(result).toEqual({
      id: '123456',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/photo.jpg',
    });
  });

  it('should throw UnauthorizedException if payload is null', async () => {
oAuthClientMock.verifyIdToken.mockResolvedValueOnce(mockTicket(undefined));
    await expect(authService.verifyGoogleToken('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if verifyIdToken throws', async () => {
    oAuthClientMock.verifyIdToken.mockRejectedValueOnce(new Error('Some error'));

    await expect(authService.verifyGoogleToken('error-token')).rejects.toThrow(UnauthorizedException);
  });
});
