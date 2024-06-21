import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { Room } from './schema/room.schema';
import { DeviceService } from '../device/device.service';
import { EventService } from '../event/event.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetEventsQueryDto } from '../event/dto/get-events.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
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
      const device = await this.deviceService.getDeviceByRoom(room.id);
      if (!device) return;

      const query: GetEventsQueryDto = {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(),
      };

      const occupancy = await this.eventService.calculateOccupancy(
        device.id,
        query,
        room.hoursPerDay,
      );

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

  async getRooms(
    floor: string,
    paginationDto?: PaginationQueryDto,
  ): Promise<Result<Room>> {
    const { page, limit } = paginationDto;
    return this.roomModel.paginate(
      { floor },
      {
        page,
        limit,
        projection: '-floor',
      },
    );
  }

  async roomStats(): Promise<{ red: number; yellow: number; green: number }> {
    const [stats] = await this.roomModel.aggregate([
      {
        $facet: {
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
          red: { $arrayElemAt: ['$red.count', 0] },
          yellow: { $arrayElemAt: ['$yellow.count', 0] },
          green: { $arrayElemAt: ['$green.count', 0] },
        },
      },
    ]);

    return stats;
  }

  async getRoom(floor: string, id: string): Promise<Room> {
    const room = await this.roomModel.findOne(
      {
        _id: id,
        floor,
      },
      '-floor',
    );
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async updateRoom(
    floor: string,
    id: string,
    updateRoom: UpdateQuery<Room>,
  ): Promise<Room> {
    const room = await this.roomModel.findOneAndUpdate(
      {
        _id: id,
        floor,
      },
      updateRoom,
      { new: true, projection: '-floor' },
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
      { projection: '-floor' },
    );
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
}
