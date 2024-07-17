import { Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert } from './schema/alert.schema';
import { Trigger } from './schema/trigger.schema';
import { MailService } from '../common/services/mail.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { WeekDay } from '../common/enums/week-day.enum';
import { ScheduleType } from '../common/enums/schedule-type.enum';
import { DeviceState } from '../device/enums/device-state.enum';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class AlertService {
  constructor(
    @InjectModel(Alert.name)
    private readonly alertModel: PaginatedModel<Alert>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendActiveAlerts() {
    const alerts = await this.alertModel.find({ active: true }).populate({
      path: 'device',
      select: 'name state updatedAt',
    });

    const alertPromises = alerts.map(async (alert) => {
      const startTime = new Date(alert.conditionStartTime);
      const now = new Date();
      const duration = (now.getTime() - startTime.getTime()) / 1000 / 60;

      if (duration >= alert.trigger.duration) {
        await this.sendAlertEmail(alert);
        await this.resetAlertCondition(alert.id);
      }
    });

    await Promise.all(alertPromises);
  }

  async handleUpdateChange(change: any) {
    const device = change.documentKey._id;
    const state: DeviceState = change.updateDescription.updatedFields.state;
    const alerts = await this.filterAlerts(device.toString());
    const currentDay = format(new Date(), 'EEEE').toLowerCase() as WeekDay;
    await this.processAlerts(alerts, state, currentDay);
  }

  private async filterAlerts(device: string): Promise<Alert[]> {
    return this.alertModel.find(
      {
        device,
        enabled: true,
      },
      '-createdAt -conditionStartTime',
      {
        populate: {
          path: 'device',
          select: 'name updatedAt',
        },
      },
    );
  }

  private async processAlerts(
    alerts: Alert[],
    state: DeviceState,
    currentDay: WeekDay,
  ) {
    const alertPromises = alerts.map(async (alert) => {
      await this.activateAlert(alert, currentDay, state);
    });
    await Promise.all(alertPromises);
  }

  private async activateAlert(
    alert: Alert,
    currentDay: WeekDay,
    state: DeviceState,
  ): Promise<void> {
    if (
      this.isScheduleMatched(alert, currentDay) &&
      this.isConditionMet(alert.trigger, state)
    ) {
      if (alert.conditionStartTime === null) {
        await this.setAlertCondition(alert.id);
      }
    } else {
      if (alert.conditionStartTime) {
        await this.resetAlertCondition(alert.id);
      }
    }
  }

  private async setAlertCondition(alert: string) {
    await this.alertModel.findByIdAndUpdate(alert, {
      conditionStartTime: new Date(),
      active: true,
    });
  }

  private async resetAlertCondition(alert: string) {
    await this.alertModel.findByIdAndUpdate(alert, {
      conditionStartTime: null,
      active: false,
    });
  }

  private async sendAlertEmail(alert: Alert) {
    try {
      const updated = format(alert.device.updatedAt, 'dd/MM/yyyy HH:mm:ss');
      await this.mailService.sendDeviceAlert(
        alert.recipients,
        alert.device.name,
        alert.device.state,
        updated,
      );
    } catch (error) {
      console.error('Failed to send alert email:', error);
    }
  }

  private isScheduleMatched(alert: Alert, currentDay: WeekDay): boolean {
    return (
      alert.scheduleType === ScheduleType.EVERYDAY ||
      (alert.scheduleType === ScheduleType.WEEKDAYS &&
        ![WeekDay.SATURDAY, WeekDay.SUNDAY].includes(currentDay)) ||
      (alert.scheduleType === ScheduleType.CUSTOM &&
        alert.weekdays.includes(currentDay))
    );
  }

  private isConditionMet(trigger: Trigger, state: DeviceState): boolean {
    return trigger.state === state;
  }

  async createAlert(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = await this.alertModel.create(createAlertDto);
    return this.getAlert(alert.id);
  }

  async getAlerts(query: PaginationQueryDto): Promise<Result<Alert>> {
    const { page, limit } = query;
    return this.alertModel.paginate(
      {},
      {
        page,
        limit,
        projection: '-createdAt -conditionStartTime',
        populate: [
          {
            path: 'device',
            select: 'name',
          },
        ],
      },
    );
  }

  async getAlert(id: string): Promise<Alert> {
    const alert = await this.alertModel.findById(
      id,
      '-createdAt1 -conditionStartTime',
      {
        populate: {
          path: 'device',
          select: 'name updatedAt state',
        },
      },
    );
    if (!alert) {
      throw new NotFoundException(`Alert #${id} not found`);
    }
    return alert;
  }

  async updateAlert(
    id: string,
    updateAlertDto: UpdateAlertDto,
  ): Promise<Alert> {
    const updatedAlert = await this.alertModel.findByIdAndUpdate(
      id,
      updateAlertDto,
      {
        new: true,
        projection: '-createdAt -conditionStartTime',
        populate: {
          path: 'device',
          select: 'name updatedAt state',
        },
      },
    );
    if (!updatedAlert) {
      throw new NotFoundException(`Alert #${id} not found`);
    }
    return updatedAlert;
  }

  async removeAlert(id: string): Promise<void> {
    const result = await this.alertModel.findByIdAndDelete(id, {
      projection: '-createdAt -conditionStartTime',
      populate: {
        path: 'device',
        select: 'name updatedAt state',
      },
    });
    if (!result) {
      throw new NotFoundException(`Alert #${id} not found`);
    }
  }
}
