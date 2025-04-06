import { Injectable } from '@nestjs/common';
import { IConfig } from './config.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigServiceImpl implements IConfig {
  constructor(private configService: ConfigService) {}

  get host(): string {
    const value = this.configService.get('HOST');
    if (!value) {
      throw new Error('HOST is not defined in the configuration');
    }
    return value;
  }

  get port(): string {
    const value = this.configService.get('PORT');
    if (!value) {
      throw new Error('PORT is not defined in the configuration');
    }
    return value;
  }

  get environment(): string {
    const value = this.configService.get('ENVIRONMENT');
    if (!value) {
      throw new Error('ENVIRONMENT is not defined in the configuration');
    }
    return value;
  }

  get databaseHost(): string {
    const value = this.configService.get('DATABASE_HOST');
    if (!value) {
      throw new Error('DATABASE_HOST is not defined in the configuration');
    }
    return value;
  }

  get databasePort(): string {
    const value = this.configService.get('DATABASE_PORT');
    if (!value) {
      throw new Error('DATABASE_PORT is not defined in the configuration');
    }
    return value;
  }

  get databaseName(): string {
    const value = this.configService.get('DATABASE_NAME');
    if (!value) {
      throw new Error('DATABASE_NAME is not defined in the configuration');
    }
    return value;
  }

  get databaseUser(): string {
    const value = this.configService.get('DATABASE_USER');
    if (!value) {
      throw new Error('DATABASE_USER is not defined in the configuration');
    }
    return value;
  }

  get databasePassword(): string {
    const value = this.configService.get('DATABASE_PASSWORD');
    if (!value) {
      throw new Error('DATABASE_PASSWORD is not defined in the configuration');
    }
    return value;
  }
}
