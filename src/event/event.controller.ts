import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { GetEventsQueryDto } from './dto/get-events.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';

@Controller({
  path: 'devices/:device/events',
  version: '1',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getEvents(
    @Param('device', IsObjectIdPipe) device: string,
    @Query() query: GetEventsQueryDto,
  ) {
    return this.eventService.processEvents(device, query);
  }

  @Get('export')
  async exportEvents(
    @CurrentUser() account: Account,
    @Param('device', IsObjectIdPipe) device: string,
    @Query() query: GetEventsQueryDto,
  ) {
    return this.eventService.exportEvents(device, query, account.sub);
  }
}
