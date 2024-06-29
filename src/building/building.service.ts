import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Building } from './schema/building.schema';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { GetBuildingsQueryDto } from './dto/get-buildings.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: PaginatedModel<Building>,
  ) {}

  async createSite(
    site: string,
    createBuildingDto: CreateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingModel.create({
      ...createBuildingDto,
      site,
    });
    return building;
  }

  async getBuildings(query?: GetBuildingsQueryDto): Promise<Result<Building>> {
    const { page, limit, search, site } = query;
    const sites = Array.isArray(site) ? site : [site];
    return this.buildingModel.paginate(
      {
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(sites.length && { site: { $in: sites } }),
      },
      {
        page,
        limit,
        projection: '-site -createdAt',
      },
    );
  }

  async updateSite(
    site: string,
    id: string,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingModel.findOneAndUpdate(
      {
        _id: id,
        site,
      },
      updateBuildingDto,
      { new: true, projection: '-site -createdAt' },
    );
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }

  async removeSite(site: string, id: string): Promise<Building> {
    const building = await this.buildingModel.findOneAndDelete({
      _id: id,
      site,
    });
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }
}
