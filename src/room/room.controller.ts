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
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  version: '1',
})
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('floors/:floor/rooms')
  createRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(floor, createRoomDto);
  }

  @Get('floors/:floor/rooms')
  getRooms(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Query() paginationDto?: PaginationQueryDto,
  ) {
    return this.roomService.getRooms(floor, paginationDto);
  }

  @Get('rooms/stats')
  getRoomStats() {
    return this.roomService.roomStats();
  }

  @Get('floors/:floor/rooms/:room')
  getRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
  ) {
    return this.roomService.getRoom(floor, room);
  }

  @Patch('floors/:floor/rooms/:room')
  updateRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoom(floor, room, updateRoomDto);
  }

  @Delete('floors/:floor/rooms/:room')
  removeRoom(
    @Param('floor', IsObjectIdPipe) floor: string,
    @Param('room', IsObjectIdPipe) room: string,
  ) {
    return this.roomService.removeRoom(floor, room);
  }
}
