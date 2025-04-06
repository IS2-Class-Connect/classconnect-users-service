import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigServiceImpl } from './config/config.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: ConfigServiceImpl,
      useClass: ConfigServiceImpl,
    },
    {
      provide: PrismaService,
      useClass: PrismaService,
    },
  ],
  exports: [ConfigServiceImpl, PrismaService],
})
export class AppModule {}
