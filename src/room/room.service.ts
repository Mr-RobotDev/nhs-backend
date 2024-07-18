import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PipelineStage } from 'mongoose';
import { Room } from './schema/room.schema';
import { DeviceService } from '../device/device.service';
import { EventService } from '../event/event.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetRoomsQueryDto } from './dto/get-rooms.dto';
import { GetRoomStatsQueryDto } from './dto/get-room-stats.dto';
import { GetEventsQueryDto } from '../event/dto/get-events.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: PaginatedModel<Room>,
    private readonly deviceService: DeviceService,
    private readonly eventService: EventService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updateRoomOccupancy() {
    const rooms = await this.roomModel.find();

    const updatePromises = rooms.map(async (room) => {
      const devices = await this.deviceService.getDevicesByRoom(room.id);

      const query: GetEventsQueryDto = {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(),
      };

      let totalOccupancy = 0;

      for (const device of devices) {
        const occupancy = await this.eventService.calculateOccupancy(
          device.id,
          query,
          room.hoursPerDay,
        );
        totalOccupancy += occupancy;
      }

      const occupancy = totalOccupancy / devices.length;
      await this.roomModel.updateOne({ _id: room.id }, { occupancy });
    });

    await Promise.all(updatePromises);
  }

  async createRoom(floor: string, createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomModel.create({
      ...createRoomDto,
      floor,
    });
  }

  async getRooms(query?: GetRoomsQueryDto): Promise<Result<Room>> {
    const { page, limit, search, floor } = query;
    const floors = Array.isArray(floor) ? floor : [floor];

    const filters: FilterQuery<Room> = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { function: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { division: { $regex: search, $options: 'i' } },
        { cluster: { $regex: search, $options: 'i' } },
      ];
    }

    if (floor) {
      filters.floor = { $in: floors };
    }

    return this.roomModel.paginate(filters, {
      page,
      limit,
      projection: '-floor -createdAt',
    });
  }

  async getRoomStats(query?: GetRoomStatsQueryDto): Promise<{
    totalRooms: number;
    totalNetUseableArea: number;
    maxOccupancy: number;
    red: number;
    yellow: number;
    green: number;
  }> {
    const { search, floor, includeWeekends, from, to } = query;
    const floors = Array.isArray(floor) ? floor : [floor];

    const filters: FilterQuery<Room> = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { function: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { division: { $regex: search, $options: 'i' } },
        { cluster: { $regex: search, $options: 'i' } },
      ];
    }

    if (floor) {
      filters.floor = { $in: floors };
    }

    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filters.createdAt = { $gte: start, $lte: end };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    filters.createdAt = { ...filters.createdAt, $lt: today };

    if (includeWeekends) {
      const excludeWeekends = [
        { $expr: { $eq: [{ $dayOfWeek: '$createdAt' }, 1] } },
        { $expr: { $eq: [{ $dayOfWeek: '$createdAt' }, 7] } },
      ];
      if (!includeWeekends) {
        filters.$nor = excludeWeekends;
      }
    }

    const pipeline: PipelineStage[] = [
      {
        $match: filters,
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          totalNetUseableArea: [
            {
              $group: {
                _id: null,
                totalNetUseableArea: { $sum: '$netUseableArea' },
              },
            },
          ],
          maxOccupancy: [
            { $group: { _id: null, max: { $max: '$occupancy' } } },
          ],
          red: [{ $match: { occupancy: { $lte: 60 } } }, { $count: 'count' }],
          yellow: [
            { $match: { occupancy: { $gt: 60, $lte: 80 } } },
            { $count: 'count' },
          ],
          green: [{ $match: { occupancy: { $gt: 80 } } }, { $count: 'count' }],
        },
      },
      {
        $project: {
          totalRooms: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
          totalNetUseableArea: {
            $ifNull: [
              { $arrayElemAt: ['$totalNetUseableArea.totalNetUseableArea', 0] },
              0,
            ],
          },
          maxOccupancy: {
            $ifNull: [{ $arrayElemAt: ['$maxOccupancy.max', 0] }, 0],
          },
          red: { $ifNull: [{ $arrayElemAt: ['$red.count', 0] }, 0] },
          yellow: { $ifNull: [{ $arrayElemAt: ['$yellow.count', 0] }, 0] },
          green: { $ifNull: [{ $arrayElemAt: ['$green.count', 0] }, 0] },
        },
      },
    ];

    const [stats] = await this.roomModel.aggregate(pipeline);
    return stats;
  }

  async updateRoom(
    floor: string,
    id: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const room = await this.roomModel.findOneAndUpdate(
      {
        _id: id,
        floor,
      },
      updateRoomDto,
      { new: true, projection: '-floor -createdAt' },
    );
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async removeRoom(floor: string, id: string): Promise<Room> {
    const room = await this.roomModel.findOneAndDelete({
      _id: id,
      floor,
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
}
