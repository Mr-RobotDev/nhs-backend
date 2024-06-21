import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { GetDevicesQueryDto } from './dto/get-devices.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';

@Controller({
  path: 'devices',
  version: '1',
})
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.OK)
  createDevice(
    @CurrentUser() account: Account,
    @Body() createDeviceDto: CreateDeviceDto,
  ) {
    return this.deviceService.createDevice(account.sub, createDeviceDto);
  }

  @Get()
  devices(
    @CurrentUser() account: Account,
    @Query() query?: GetDevicesQueryDto,
  ) {
    return this.deviceService.devices(account.sub, query);
  }

  @Get('stats')
  deviceStats(@CurrentUser() account: Account) {
    return this.deviceService.deviceStats(account.sub);
  }

  @Get(':device')
  device(
    @CurrentUser() account: Account,
    @Param('device', IsObjectIdPipe) device: string,
  ) {
    return this.deviceService.device(account.sub, device);
  }

  @Roles(Role.ADMIN)
  @Patch(':device')
  updateDevice(
    @CurrentUser() account: Account,
    @Param('device', IsObjectIdPipe) device: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.deviceService.updateDevice(
      account.sub,
      device,
      updateDeviceDto,
    );
  }

  @Roles(Role.ADMIN)
  @Delete(':device')
  removeDevice(
    @CurrentUser() account: Account,
    @Param('device', IsObjectIdPipe) device: string,
  ) {
    return this.deviceService.removeDevice(account.sub, device);
  }
}
