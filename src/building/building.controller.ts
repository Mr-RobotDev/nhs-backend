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
import { GetBuildingsQueryDto } from './dto/get-buildings.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  version: '1',
})
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post('sites/:site/buildings')
  createSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Body() createBuildingDto: CreateBuildingDto,
  ) {
    return this.buildingService.createSite(site, createBuildingDto);
  }

  @Get('buildings')
  getSites(@Query() query?: GetBuildingsQueryDto) {
    return this.buildingService.getSites(query);
  }

  @Patch('sites/:site/buildings/:building')
  updateSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.updateSite(site, building, updateBuildingDto);
  }

  @Delete('sites/:site/buildings/:building')
  removeSite(
    @Param('site', IsObjectIdPipe) site: string,
    @Param('building', IsObjectIdPipe) building: string,
  ) {
    return this.buildingService.removeSite(site, building);
  }
}
