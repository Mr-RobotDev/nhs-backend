import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';

@Controller({
  path: 'dashboards',
  version: '1',
})
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.OK)
  createDashboard(
    @CurrentUser() account: Account,
    @Body() createDashboardDto: CreateDashboardDto,
  ) {
    return this.dashboardService.createDashboard(
      account.sub,
      createDashboardDto,
    );
  }

  @Get()
  getDashboards(@CurrentUser() account: Account) {
    return this.dashboardService.getDashboards(account.sub);
  }

  @Get(':dashboard')
  getDashboard(
    @CurrentUser() account: Account,
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
  ) {
    return this.dashboardService.getDashboard(account.sub, dashboard);
  }

  @Roles(Role.ADMIN)
  @Patch(':dashboard')
  updateDashboard(
    @CurrentUser() account: Account,
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.updateDashboard(
      dashboard,
      updateDashboardDto,
      account.sub,
    );
  }

  @Roles(Role.ADMIN)
  @Delete(':dashboard')
  remove(
    @CurrentUser() account: Account,
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
  ) {
    return this.dashboardService.removeDashboard(account.sub, dashboard);
  }
}
