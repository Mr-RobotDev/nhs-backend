import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Floor } from './schema/floor.schema';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { GetFloorsQueryDto } from './dto/get-floors.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class FloorService {
  constructor(
    @InjectModel(Floor.name)
    private readonly floorModel: PaginatedModel<Floor>,
  ) {}

  async createFloor(
    building: string,
    createFloorDto: CreateFloorDto,
  ): Promise<Floor> {
    return this.floorModel.create({
      ...createFloorDto,
      building,
    });
  }

  async getFloors(query?: GetFloorsQueryDto): Promise<Result<Floor>> {
    const { page, limit, search, building } = query;
    const buildings = Array.isArray(building) ? building : [building];

    return this.floorModel.paginate(
      {
        ...(search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
          ],
        }),
        ...(building && { building: { $in: buildings } }),
      },
      {
        page,
        limit,
        projection: '-building -createdAt',
      },
    );
  }

  async updateFloor(
    building: string,
    id: string,
    updateFloorDto: UpdateFloorDto,
  ): Promise<Floor> {
    const floor = await this.floorModel.findOneAndUpdate(
      {
        _id: id,
        building,
      },
      updateFloorDto,
      { new: true, projection: '-building -createdAt' },
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async removeFloor(building: string, id: string): Promise<Floor> {
    const floor = await this.floorModel.findOneAndDelete({
      _id: id,
      building,
    });
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }
}
