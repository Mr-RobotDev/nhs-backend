import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  path: 'sites/:site/buildings',
  version: '1',
})
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  createSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Body() createBuildingDto: CreateBuildingDto,
  ) {
    return this.buildingService.createSite(site, createBuildingDto);
  }

  @Get()
  getSites(
    @Param('site', IsObjectIdPipe) site: string,
    @Query() paginationDto?: PaginationQueryDto,
  ) {
    return this.buildingService.getSites(site, paginationDto);
  }

  @Get(':building')
  getSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
  ) {
    return this.buildingService.getSite(site, building);
  }

  @Patch(':building')
  updateSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.updateSite(site, building, updateBuildingDto);
  }

  @Delete(':building')
  removeSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
  ) {
    return this.buildingService.removeSite(site, building);
  }
}
