import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from './modules/user.module';

/**
 * The root module of the application. 
 * It imports necessary modules like UserModule and ConfigModule.
 * It also provides PrismaService for database interactions and makes it available globally.
 */
@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,  
      envFilePath: '.env', 
    }),
  ],
  providers: [
    {
      provide: PrismaService,
      useClass: PrismaService,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
