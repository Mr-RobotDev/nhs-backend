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
import { GetRoomDataTableQueryDto } from './dto/get-room-data-table.dto';
import { RoomStats } from './interfaces/room-stats.interface';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';
import { GetRoomDataQueryDto } from './dto/get-room-data.dto';

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
      projection: '-organization -site -building -floor -createdAt',
    });
  }

  async getRoomStats(query?: GetRoomStatsQueryDto): Promise<RoomStats> {
    const { organization, site, building, floor } = query;
    const organizations = Array.isArray(organization)
      ? organization
      : [organization];
    const sites = Array.isArray(site) ? site : [site];
    const buildings = Array.isArray(building) ? building : [building];
    const floors = Array.isArray(floor) ? floor : [floor];

    const filters: FilterQuery<Room> = {};

    if (floor) {
      filters.floor = { $in: floors };
    }

    if (organization) {
      filters.organization = { $in: organizations };
    }

    if (site) {
      filters.site = { $in: sites };
    }

    if (building) {
      filters.building = { $in: buildings };
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
          amber: [
            { $match: { occupancy: { $gt: 60, $lte: 80 } } },
            { $count: 'count' },
          ],
          green: [{ $match: { occupancy: { $gt: 80 } } }, { $count: 'count' }],
          roomFunctions: [
            { $group: { _id: '$function', count: { $sum: 1 } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
          ],
          departments: [
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
          ],
          rooms: [
            {
              $group: {
                _id: { name: '$name', occupancy: '$occupancy' },
                occupancy: { $first: '$occupancy' },
              },
            },
            {
              $project: {
                name: '$_id.name',
                occupancy: {
                  $switch: {
                    branches: [
                      { case: { $lte: ['$_id.occupancy', 60] }, then: 'red' },
                      {
                        case: {
                          $and: [
                            { $gt: ['$_id.occupancy', 60] },
                            { $lte: ['$_id.occupancy', 80] },
                          ],
                        },
                        then: 'amber',
                      },
                      { case: { $gt: ['$_id.occupancy', 80] }, then: 'green' },
                    ],
                    default: 'unknown',
                  },
                },
                _id: 0,
              },
            },
          ],
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
          amber: { $ifNull: [{ $arrayElemAt: ['$amber.count', 0] }, 0] },
          green: { $ifNull: [{ $arrayElemAt: ['$green.count', 0] }, 0] },
          roomFunctions: 1,
          departments: 1,
          rooms: 1,
        },
      },
    ];

    const [stats] = await this.roomModel.aggregate(pipeline);
    return stats;
  }

  async getRoomData(query?: GetRoomDataQueryDto): Promise<any> {
    const { organization, site, building, floor, includeWeekends, from, to } =
      query;

    const organizations = Array.isArray(organization)
      ? organization
      : [organization];
    const sites = Array.isArray(site) ? site : [site];
    const buildings = Array.isArray(building) ? building : [building];
    const floors = Array.isArray(floor) ? floor : [floor];

    const filters: FilterQuery<Room> = {};

    if (floor) {
      filters.floor = { $in: floors };
    }

    if (organization) {
      filters.organization = { $in: organizations };
    }

    if (site) {
      filters.site = { $in: sites };
    }

    if (building) {
      filters.building = { $in: buildings };
    }

    const rooms = await this.roomModel.find(filters);
    const totalNetUseableArea = rooms.reduce(
      (acc, room) => acc + room.netUseableArea,
      0,
    );
    const totalMaxUseableDesks = rooms.reduce(
      (acc, room) => acc + room.maxDeskOccupation,
      0,
    );
    const totalMaxUseableWorkstations = rooms.reduce(
      (acc, room) => acc + room.numWorkstations,
      0,
    );

    let totalOccupancy = 0;
    const updatePromises = rooms.map(async (room) => {
      const devices = await this.deviceService.getDevicesByRoom(room.id);

      const query: GetEventsQueryDto = {
        from,
        to,
        ...(includeWeekends && { includeWeekends: Boolean(includeWeekends) }),
      };

      for (const device of devices) {
        const occupancy = await this.eventService.calculateOccupancy(
          device.id,
          query,
          room.hoursPerDay,
        );
        totalOccupancy += occupancy;
      }
    });

    await Promise.all(updatePromises);

    const difference = this.calculateDateDifference(from, to, includeWeekends);

    return {
      totalOccupancy: totalOccupancy / rooms.length / difference,
      totalNetUseableArea,
      totalMaxUseableDesks,
      totalMaxUseableWorkstations,
    };
  }

  async getRoomDataTable(query?: GetRoomDataTableQueryDto) {
    const {
      organization,
      site,
      building,
      floor,
      includeWeekends,
      from,
      to,
      page = 1,
      limit = 10,
    } = query;

    const organizations = Array.isArray(organization)
      ? organization
      : [organization];
    const sites = Array.isArray(site) ? site : [site];
    const buildings = Array.isArray(building) ? building : [building];
    const floors = Array.isArray(floor) ? floor : [floor];

    const filters: FilterQuery<Room> = {};

    if (floor) {
      filters.floor = { $in: floors };
    }

    if (organization) {
      filters.organization = { $in: organizations };
    }

    if (site) {
      filters.site = { $in: sites };
    }

    if (building) {
      filters.building = { $in: buildings };
    }

    const [rooms, totalResults] = await Promise.all([
      this.roomModel
        .find(filters)
        .select(
          'netUseableArea department clusterDescription maxDeskOccupation numWorkstations hoursPerDay organization site building floor',
        )
        .populate({
          path: 'organization',
          select: 'name',
        })
        .populate({
          path: 'site',
          select: 'name',
        })
        .populate({
          path: 'building',
          select: 'name',
        })
        .populate({
          path: 'floor',
          select: 'name code',
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.roomModel.countDocuments(filters).exec(),
    ]);

    const results = await Promise.all(
      rooms.map(async (room) => {
        const devices = await this.deviceService.getDevicesByRoom(room.id);

        const query: GetEventsQueryDto = {
          from,
          to,
          ...(includeWeekends && { includeWeekends: Boolean(includeWeekends) }),
        };

        let totalOccupancy = 0;
        const occupancyPromises = devices.map(async (device) => {
          const occupancy = await this.eventService.calculateOccupancy(
            device.id,
            query,
            room.hoursPerDay,
          );
          totalOccupancy += occupancy;
        });

        await Promise.all(occupancyPromises);

        const difference = this.calculateDateDifference(
          from,
          to,
          includeWeekends,
        );
        const roomOccupancy = totalOccupancy / devices.length / difference;

        return {
          organization: room.organization.name,
          site: room.site.name,
          building: room.building.name,
          code: room.floor.code,
          floor: room.floor.name,
          netUseableArea: room.netUseableArea,
          maxDeskOccupation: room.maxDeskOccupation,
          numWorkstations: room.numWorkstations,
          occupancy: roomOccupancy,
        };
      }),
    );

    return {
      results,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
      },
    };
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
      {
        new: true,
        projection: '-organization -site -building -floor -createdAt',
      },
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

  private calculateDateDifference(
    from: Date,
    to: Date,
    includeWeekends?: boolean,
  ): number {
    const oneDay = 1000 * 60 * 60 * 24;
    let difference = (to.getTime() - from.getTime()) / oneDay;

    if (includeWeekends === false) {
      const currentDate = new Date(from);
      while (currentDate <= to) {
        const day = currentDate.getDay();
        if (day === 0 || day === 6) {
          difference--;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return difference;
  }
}
