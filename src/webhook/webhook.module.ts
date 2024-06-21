import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { EventModule } from '../event/event.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [EventModule, DeviceModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
