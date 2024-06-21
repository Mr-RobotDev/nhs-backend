import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Building } from './schema/building.schema';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: PaginatedModel<Building>,
  ) {}

  async createSite(site: string, createBuildingDto: CreateBuildingDto) {
    const building = await this.buildingModel.create({
      ...createBuildingDto,
      site,
    });
    return building;
  }

  async getSites(site: string, paginationDto?: PaginationQueryDto) {
    const { page, limit } = paginationDto;
    return this.buildingModel.paginate({ site }, { page, limit });
  }

  async getSite(site: string, id: string) {
    const building = await this.buildingModel.findOne(
      {
        _id: id,
        site,
      },
      '-site',
    );
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }

  async updateSite(
    site: string,
    id: string,
    updateBuildingDto: UpdateBuildingDto,
  ) {
    const building = await this.buildingModel.findOneAndUpdate(
      {
        _id: id,
        site,
      },
      updateBuildingDto,
      { new: true, projection: '-site' },
    );
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }

  async removeSite(site: string, id: string) {
    const building = await this.buildingModel.findOneAndDelete(
      {
        _id: id,
        site,
      },
      { projection: '-site' },
    );
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }
}
