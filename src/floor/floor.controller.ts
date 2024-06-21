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
import { FloorService } from './floor.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  path: 'buildings/:building/floors',
  version: '1',
})
export class FloorController {
  constructor(private readonly floorService: FloorService) {}

  @Post()
  createFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Body() createFloorDto: CreateFloorDto,
  ) {
    return this.floorService.createFloor(building, createFloorDto);
  }

  @Get()
  getFloors(
    @Param('building', IsObjectIdPipe) building: string,
    @Query() paginationDto?: PaginationQueryDto,
  ) {
    return this.floorService.getFloors(building, paginationDto);
  }

  @Get(':floor')
  getFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
  ) {
    return this.floorService.getFloor(building, floor);
  }

  @Patch(':floor')
  updateFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    return this.floorService.updateFloor(building, floor, updateFloorDto);
  }

  @Delete(':floor')
  removeFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
  ) {
    return this.floorService.removeFloor(building, floor);
  }
}
