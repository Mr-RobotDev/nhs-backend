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
import { GetFloorsQueryDto } from './dto/get-floors.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  version: '1',
})
export class FloorController {
  constructor(private readonly floorService: FloorService) {}

  @Roles(Role.ADMIN)
  @Post('buildings/:building/floors')
  createFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Body() createFloorDto: CreateFloorDto,
  ) {
    return this.floorService.createFloor(building, createFloorDto);
  }

  @Get('floors')
  getFloors(@Query() query?: GetFloorsQueryDto) {
    return this.floorService.getFloors(query);
  }

  @Roles(Role.ADMIN)
  @Patch('buildings/:building/floors/:floor')
  updateFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    return this.floorService.updateFloor(building, floor, updateFloorDto);
  }

  @Roles(Role.ADMIN)
  @Delete('buildings/:building/floors/:floor')
  removeFloor(
    @Param('building', IsObjectIdPipe) building: string,
    @Param('floor', IsObjectIdPipe) floor: string,
  ) {
    return this.floorService.removeFloor(building, floor);
  }
}
