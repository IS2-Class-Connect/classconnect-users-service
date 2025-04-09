import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from './modules/user.module';

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
  exports: [ PrismaService],
})
export class AppModule {}
