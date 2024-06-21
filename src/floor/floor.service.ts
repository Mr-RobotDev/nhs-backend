import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Floor } from './schema/floor.schema';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
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
    const floor = await this.floorModel.create({
      ...createFloorDto,
      building,
    });
    return floor;
  }

  async getFloors(
    building: string,
    paginationDto?: PaginationQueryDto,
  ): Promise<Result<Floor>> {
    const { page, limit } = paginationDto;
    return this.floorModel.paginate(
      { building },
      {
        page,
        limit,
        projection: '-building',
      },
    );
  }

  async getFloor(building: string, id: string): Promise<Floor> {
    const floor = await this.floorModel.findOne(
      {
        _id: id,
        building,
      },
      '-building',
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
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
      { new: true, projection: '-building' },
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async removeFloor(building: string, id: string): Promise<Floor> {
    const floor = await this.floorModel.findOneAndDelete(
      {
        _id: id,
        building,
      },
      { projection: '-building' },
    );
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }
}
