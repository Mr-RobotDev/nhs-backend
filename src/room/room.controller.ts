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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetRoomsQueryDto } from './dto/get-rooms.dto';
import { GetRoomStatsQueryDto } from './dto/get-room-stats.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  version: '1',
})
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Roles(Role.ADMIN)
  @Post('floors/:floor/rooms')
  createRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(floor, createRoomDto);
  }

  @Get('rooms')
  getRooms(@Query() query?: GetRoomsQueryDto) {
    return this.roomService.getRooms(query);
  }

  @Get('rooms/stats')
  getRoomStats(@Query() query?: GetRoomStatsQueryDto) {
    return this.roomService.getRoomStats(query);
  }

  @Roles(Role.ADMIN)
  @Patch('floors/:floor/rooms/:room')
  updateRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoom(floor, room, updateRoomDto);
  }

  @Roles(Role.ADMIN)
  @Delete('floors/:floor/rooms/:room')
  removeRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
  ) {
    return this.roomService.removeRoom(floor, room);
  }
}
