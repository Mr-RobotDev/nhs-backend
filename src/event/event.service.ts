import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { createObjectCsvWriter } from 'csv-writer';
import { format } from 'date-fns';
import * as path from 'path';
import * as fs from 'fs';
import { Event } from './schema/event.schema';
import { Device } from '../device/schema/device.schema';
import { User } from '../user/schema/user.schema';
import { MediaService } from '../media/media.service';
import { DeviceService } from '../device/device.service';
import { UserService } from '../user/user.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsQueryDto } from './dto/get-events.dto';
import { Folder } from '../common/enums/folder.enum';
import { DeviceState } from '../device/enums/device-state.enum';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { PartialUser } from '../user/types/partial-user.type';
import { Interval } from './interfaces/interval.interface';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: PaginatedModel<Event>,
    private readonly mediaService: MediaService,
    private readonly deviceService: DeviceService,
    private readonly userService: UserService,
  ) {}

  async calculateOccupancy(
    device: string,
    query: GetEventsQueryDto,
    openingHours: number,
  ) {
    const intervals = await this.processEvents(device, query);

    let motionMinutes: number = 0;

    for (const interval of intervals) {
      if (interval.state === DeviceState.MOTION_DETECTED) {
        const duration =
          (new Date(interval.to).getTime() -
            new Date(interval.from).getTime()) /
          60000;
        motionMinutes += duration;
      }
    }

    return (motionMinutes / openingHours) * 100;
  }

  createEvent(createEventDto: CreateEventDto): Promise<Event> {
    return this.eventModel.create(createEventDto);
  }

  async getEvents(device: string, query: GetEventsQueryDto): Promise<Event[]> {
    const { from, to, includeWeekends } = query;
    const adjustedTo = new Date(to);
    adjustedTo.setHours(23, 59, 59, 999);

    let filter: FilterQuery<Event> = {
      device,
      createdAt: { $gte: from, $lte: adjustedTo },
    };

    if (includeWeekends === false) {
      filter = {
        ...filter,
        $expr: {
          $not: {
            $in: [{ $dayOfWeek: '$createdAt' }, [1, 7]],
          },
        },
      };
    }

    return this.eventModel.find(filter).sort({ createdAt: 1 });
  }

  async processEvents(
    device: string,
    query: GetEventsQueryDto,
  ): Promise<Interval[]> {
    const events = await this.getEvents(device, query);

    const intervals: Interval[] = [];
    let currentInterval = null;

    events.forEach((event) => {
      if (!currentInterval) {
        currentInterval = {
          state: event.state,
          from: event.createdAt,
        };
      } else if (currentInterval.state !== event.state) {
        currentInterval.to = event.createdAt;
        intervals.push(currentInterval);

        currentInterval = {
          state: event.state,
          from: event.createdAt,
        };
      }
    });

    if (currentInterval) {
      currentInterval.to = new Date();
      intervals.push(currentInterval);
    }

    return intervals;
  }

  async getFilePath(
    events: Event[],
    device: Device,
    from: Date,
    to: Date,
    user?: Partial<User>,
  ): Promise<string> {
    const exportsDirectory = path.join(__dirname, '../../../exports');
    if (!fs.existsSync(exportsDirectory)) {
      fs.mkdirSync(exportsDirectory, { recursive: true });
    }

    const formattedFrom = format(new Date(from), 'MMMM d, yyyy');
    const formattedTo = format(new Date(to), 'MMMM d, yyyy');
    const currentTime = format(new Date(), 'HH:mm:ss');

    const filePath = path.join(
      exportsDirectory,
      `Events - ${device.name} (${formattedFrom} - ${formattedTo}) - ${currentTime}.csv`,
    );

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'Event ID' },
        { id: 'deviceName', title: 'Device Name' },
        { id: 'deviceType', title: 'Device Type' },
        { id: 'state', title: 'State' },
        { id: 'timestamp', title: 'Timestamp' },
        ...(user ? [{ id: 'exportedBy', title: 'Exported By' }] : []),
      ],
    });

    const records = events.map((event) => ({
      id: event.id,
      deviceName: device.name,
      deviceType: device.type,
      state: event.state,
      timestamp: event.createdAt,
      ...(user && {
        exportedBy: `${user.firstName} ${user.lastName}`,
      }),
    }));
    await csvWriter.writeRecords(records);

    return filePath;
  }

  async exportEvents(
    deviceId: string,
    query: GetEventsQueryDto,
    user?: string,
  ) {
    const { from, to } = query;
    const events = await this.getEvents(deviceId, query);
    console.log(events[0]);
    const device = await this.deviceService.getDeviceById(deviceId);
    let result: PartialUser;
    if (user) {
      result = await this.userService.getUserById(user);
    }

    const filePath = await this.getFilePath(
      events,
      device,
      from,
      to,
      result.user,
    );

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const url = await this.mediaService.uploadFile(
      fileBuffer,
      fileName,
      Folder.EXPORTS,
    );
    fs.unlinkSync(filePath);
    return { url };
  }
}
