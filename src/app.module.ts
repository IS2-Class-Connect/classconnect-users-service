import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user.module';
import { PrismaModule } from 'prisma/prisma.module';

/**
 * The root module of the application.
 * It imports necessary modules like UserModule and ConfigModule.
 * It also provides PrismaService for database interactions and makes it available globally.
 */
@Module({
  imports: [
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
