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
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  path: 'alerts',
  version: '1',
})
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.OK)
  createAlert(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.createAlert(createAlertDto);
  }

  @Get()
  getAlerts(@Query() query: PaginationQueryDto) {
    return this.alertService.getAlerts(query);
  }

  @Get('stats')
  getAlertsStats() {
    return this.alertService.getAlertsStats();
  }

  @Get(':alert')
  getAlert(@Param('alert', IsObjectIdPipe) alert: string) {
    return this.alertService.getAlert(alert);
  }

  @Roles(Role.ADMIN)
  @Patch(':alert')
  updateAlert(
    @Param('alert', IsObjectIdPipe) alert: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    return this.alertService.updateAlert(alert, updateAlertDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':alert')
  removeAlert(@Param('alert', IsObjectIdPipe) alert: string) {
    return this.alertService.removeAlert(alert);
  }
}
