import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
      provide: PrismaService,
      useClass: PrismaService,
    },
  ],
  exports: [ PrismaService],
})
export class AppModule {}
