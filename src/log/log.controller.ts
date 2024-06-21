import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { GetLogsQueryDto } from './dto/get-logs.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@Controller({
  path: 'logs',
  version: '1',
})
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Roles(Role.ADMIN)
  @Get()
  async getLogs(@Query() query: GetLogsQueryDto) {
    return this.logService.getLogs(query);
  }
}
