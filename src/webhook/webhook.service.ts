import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { EventService } from '../event/event.service';
import { DeviceService } from '../device/device.service';
import { EventType } from '../event/enums/event-type.enum';
import { DeviceState } from '../device/enums/device-state.enum';

@Injectable()
export class WebhookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventService: EventService,
    private readonly deviceService: DeviceService,
  ) {}

  async receiveEvents(payload: any, signature: string): Promise<void> {
    if (!this.verifyRequest(JSON.stringify(payload), signature)) {
      throw new BadRequestException();
    }

    const eventType: EventType = payload.event.eventType;

    switch (eventType) {
      case EventType.MOTION:
        await this.handleMotionEvent(payload);
        break;
      case EventType.NETWORK_STATUS:
        await this.handleNetworkStatusEvent(payload);
        break;
      case EventType.CONNECTION_STATUS:
        await this.handleConnectionStatusEvent(payload);
        break;
      default:
        break;
    }
  }

  private verifyRequest(payload: string, signature: string): boolean {
    let decoded: any;
    try {
      decoded = jwt.verify(
        signature,
        this.configService.get('dataConnectorSecret'),
        {
          algorithms: ['HS256'],
        },
      );
    } catch (error) {
      return false;
    }

    const hash = crypto.createHash('sha256');
    const checksum = hash.update(payload).digest('hex');
    if (checksum !== decoded.checksum_sha256) {
      return false;
    }
    return true;
  }

  private async handleMotionEvent(payload: any): Promise<void> {
    const oem: string = payload.metadata.deviceId;
    const state: DeviceState = payload.event.data.motion.state;

    const device = await this.deviceService.updateDeviceByOem(oem, {
      state,
    });

    await this.eventService.createEvent({
      device: device.id,
      state,
    });
  }

  private async handleNetworkStatusEvent(payload: any): Promise<void> {
    const oem: string = payload.metadata.deviceId;
    const signalStrength: number =
      payload.event.data.networkStatus.signalStrength;

    await this.deviceService.updateDeviceByOem(oem, {
      signalStrength,
    });
  }

  private async handleConnectionStatusEvent(payload: any): Promise<void> {
    const oem: string = payload.metadata.deviceId;
    const isOffline: boolean =
      payload.event.data.connectionStatus.connection === 'OFFLINE'
        ? true
        : false;

    await this.deviceService.updateDeviceByOem(oem, {
      isOffline,
    });
  }
}
