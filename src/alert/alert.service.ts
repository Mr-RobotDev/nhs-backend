import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Alert } from './schema/alert.schema';
import { Trigger } from './schema/trigger.schema';
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
  private conditionStartTimes = new Map<string, Date>();

  constructor(
    @InjectModel(Alert.name)
    private readonly alertModel: PaginatedModel<Alert>,
  ) {}

  async filterAlerts(device: string): Promise<Alert[]> {
    return this.alertModel.find(
      {
        device,
        enabled: true,
      },
      '-createdAt',
      {
        populate: {
          path: 'device',
          select: 'name updatedAt',
        },
      },
    );
  }

  shouldSendAlert(
    alert: Alert,
    currentDay: WeekDay,
    state: DeviceState,
  ): boolean {
    const alertKey = `${alert.id}-${state}`;

    if (this.isScheduleMatched(alert, currentDay)) {
      if (this.isConditionMet(alert.trigger, state)) {
        if (!this.conditionStartTimes.has(alertKey)) {
          this.conditionStartTimes.set(alertKey, new Date());
        }

        const startTime = this.conditionStartTimes.get(alertKey);
        const now = new Date();
        const duration = (now.getTime() - startTime.getTime()) / 1000 / 60;

        if (duration >= alert.trigger.duration) {
          this.conditionStartTimes.delete(alertKey);
          return true;
        }
      } else {
        this.conditionStartTimes.delete(alertKey);
      }
    }
    return false;
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
    const alert = await this.alertModel.findOne({
      device: createAlertDto.device,
    });
    if (alert) {
      throw new BadRequestException('An alert already exists for this device');
    }
    const newAlert = await this.alertModel.create(createAlertDto);
    return this.getAlert(newAlert.id);
  }

  async getAlerts(query: PaginationQueryDto): Promise<Result<Alert>> {
    const { page, limit } = query;
    return this.alertModel.paginate(
      {},
      {
        page,
        limit,
        projection: '-createdAt',
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
    const alert = await this.alertModel.findById(id, '-createdAt', {
      populate: {
        path: 'device',
        select: 'name updatedAt state',
      },
    });
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
        projection: '-createdAt',
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
      projection: '-createdAt',
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
