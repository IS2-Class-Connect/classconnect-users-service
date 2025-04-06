import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigServiceImpl } from './config/config.service';
import { PingModule } from './modules/ping.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    PingModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
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
