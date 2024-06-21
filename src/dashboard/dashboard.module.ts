import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Dashboard, DashboardSchema } from './schema/dashboard.schema';
import { LogModule } from '../log/log.module';
import { CardModule } from '../card/card.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Dashboard.name,
        schema: DashboardSchema,
      },
    ]),
    LogModule,
    CardModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
