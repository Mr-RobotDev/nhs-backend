import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { WebhookModule } from './webhook/webhook.module';
import { EventModule } from './event/event.module';
import { DeviceModule } from './device/device.module';
import { LogModule } from './log/log.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CardModule } from './card/card.module';
import { ReportModule } from './report/report.module';
import { AlertModule } from './alert/alert.module';
import { SiteModule } from './site/site.module';
import { BuildingModule } from './building/building.module';
import { FloorModule } from './floor/floor.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CacheModule.register({
      ttl: 3600,
      max: 100,
    }),
    ScheduleModule.forRoot(),
    MediaModule,
    UserModule,
    AuthModule,
    WebhookModule,
    EventModule,
    DeviceModule,
    LogModule,
    DashboardModule,
    CardModule,
    AlertModule,
    ReportModule,
    SiteModule,
    BuildingModule,
    FloorModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
