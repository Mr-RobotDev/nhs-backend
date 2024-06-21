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
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  path: 'dashboards/:dashboard/reports',
  version: '1',
})
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(Role.ADMIN)
  @Post()
  createReport(
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportService.createReport(dashboard, createReportDto);
  }

  @Get()
  getReports(
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reportService.getReports(dashboard, query);
  }

  @Get(':report')
  getReport(
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
    @Param('report', IsObjectIdPipe) report: string,
  ) {
    return this.reportService.getReport(dashboard, report);
  }

  @Roles(Role.ADMIN)
  @Patch(':report')
  updateReport(
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
    @Param('report', IsObjectIdPipe) report: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportService.updateReport(dashboard, report, updateReportDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':report')
  removeReport(
    @Param('dashboard', IsObjectIdPipe) dashboard: string,
    @Param('report', IsObjectIdPipe) report: string,
  ) {
    return this.reportService.removeReport(dashboard, report);
  }
}
