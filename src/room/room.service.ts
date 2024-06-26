import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './schema/room.schema';
import { DeviceService } from '../device/device.service';
import { EventService } from '../event/event.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetRoomsQueryDto } from './dto/get-rooms.dto';
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
    const room = await this.roomModel.create({
      ...createRoomDto,
      floor,
    });
    return room;
  }

  async getRooms(query?: GetRoomsQueryDto): Promise<Result<Room>> {
    const { page, limit, search, floor } = query;
    return this.roomModel.paginate(
      {
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(floor && { floor: { $in: floor } }),
      },
      {
        page,
        limit,
        projection: '-floor -createdAt',
      },
    );
  }

  async roomStats(): Promise<{
    totalRooms: number;
    red: number;
    yellow: number;
    green: number;
  }> {
    const [stats] = await this.roomModel.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
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
          totalRooms: { $arrayElemAt: ['$total.count', 0] },
          red: { $arrayElemAt: ['$red.count', 0] },
          yellow: { $arrayElemAt: ['$yellow.count', 0] },
          green: { $arrayElemAt: ['$green.count', 0] },
        },
      },
    ]);

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
    const room = await this.roomModel.findOneAndDelete(
      {
        _id: id,
        floor,
      },
      { projection: '-floor -createdAt' },
    );
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
}
