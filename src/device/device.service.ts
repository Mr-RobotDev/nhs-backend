import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './schema/device.schema';
import { LogService } from '../log/log.service';
import { AlertService } from '../alert/alert.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { GetDevicesQueryDto } from './dto/get-devices.dto';
import { UpdateDeviceByOem } from './dto/update-device-by-oem.dto';
import { Action } from '../log/enums/action.enum';
import { Page } from '../log/enums/page.enum';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: PaginatedModel<Device>,
    private readonly logService: LogService,
    private readonly alertService: AlertService,
  ) {
    this.getEventStream();
  }

  getEventStream() {
    const changeStream = this.deviceModel.watch();
    changeStream.on('change', async (change) => {
      if (change.operationType === 'update') {
        await this.alertService.handleUpdateChange(change);
      }
    });
  }

  async getDevicesByRoom(room: string): Promise<Device[]> {
    return this.deviceModel.find({ room });
  }

  async getDeviceById(device: string): Promise<Device> {
    return this.deviceModel.findById(device);
  }

  async createDevice(
    user: string,
    createDeviceDto: CreateDeviceDto,
  ): Promise<Device> {
    const device = await this.deviceModel.create(createDeviceDto);
    await this.logService.createLog(user, {
      action: Action.CREATED,
      page: Page.DEVICE,
      device: device.id,
    });
    return device;
  }

  async devices(
    user: string,
    query?: GetDevicesQueryDto,
  ): Promise<Result<Device>> {
    const { search, organization, site, building, floor, room, page, limit } =
      query;
    await this.logService.createLog(user, {
      action: Action.VIEWED,
      page: Page.DEVICES,
    });

    const organizations = Array.isArray(organization)
      ? organization
      : [organization];
    const sites = Array.isArray(site) ? site : [site];
    const buildings = Array.isArray(building) ? building : [building];
    const floors = Array.isArray(floor) ? floor : [floor];
    const rooms = Array.isArray(room) ? room : [room];

    return this.deviceModel.paginate(
      {
        ...(organization && { organization: { $in: organizations } }),
        ...(site && { site: { $in: sites } }),
        ...(building && { building: { $in: buildings } }),
        ...(floor && { floor: { $in: floors } }),
        ...(room && { room: { $in: rooms } }),
        ...(search && {
          $or: [{ oem: search }, { name: { $regex: search, $options: 'i' } }],
        }),
      },
      {
        page,
        limit,
        sortBy: '-updatedAt',
        projection: '-organization -site -building -floor -room -createdAt',
      },
    );
  }

  async device(user: string, id: string): Promise<Device> {
    const device = await this.deviceModel.findById(
      id,
      '-organization -site -building -floor -room -createdAt',
    );
    if (!device) {
      throw new NotFoundException(`Device #${id} not found`);
    }
    await this.logService.createLog(user, {
      action: Action.VIEWED,
      page: Page.DEVICE,
      device: id,
    });
    return device;
  }

  async deviceStats(user: string): Promise<{
    totalDevices: number;
    online: number;
    offline: number;
  }> {
    const [stats] = await this.deviceModel.aggregate([
      {
        $group: {
          _id: null,
          totalDevices: { $sum: 1 },
          online: {
            $sum: {
              $cond: [{ $eq: ['$isOffline', false] }, 1, 0],
            },
          },
          offline: {
            $sum: {
              $cond: [{ $eq: ['$isOffline', true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDevices: 1,
          online: 1,
          offline: 1,
        },
      },
    ]);
    await this.logService.createLog(user, {
      action: Action.VIEWED,
      page: Page.FLOOR_PLAN,
    });

    return stats;
  }

  async updateDevice(
    user: string,
    id: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device> {
    const device = await this.deviceModel.findByIdAndUpdate(
      id,
      updateDeviceDto,
      {
        new: true,
        projection: '-organization -site -building -floor -room -createdAt',
      },
    );
    if (!device) {
      throw new NotFoundException(`Device #${id} not found`);
    }
    await this.logService.createLog(user, {
      action: Action.UPDATED,
      page: Page.DEVICE,
      device: id,
    });
    return device;
  }

  async removeDevice(user: string, id: string): Promise<Device> {
    const device = await this.deviceModel.findByIdAndDelete(id, {
      projection: '-organization -site -building -floor -room -createdAt',
    });
    if (!device) {
      throw new NotFoundException(`Device #${id} not found`);
    }
    await this.logService.createLog(user, {
      action: Action.DELETED,
      page: Page.DEVICE,
      device: id,
    });
    return device;
  }

  async updateDeviceByOem(
    oem: string,
    updateDeviceByOem: UpdateDeviceByOem,
  ): Promise<Device> {
    return this.deviceModel.findOneAndUpdate(
      {
        oem,
      },
      updateDeviceByOem,
      {
        new: true,
      },
    );
  }
}
