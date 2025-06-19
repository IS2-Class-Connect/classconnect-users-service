import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.CLIENT_ID || 'client_id';
//Verificates if a google token is valid.
@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(CLIENT_ID);
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Error validating token');
      }

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      console.log(error,idToken)
      throw new UnauthorizedException('Error validating token');
    }
  }
}
