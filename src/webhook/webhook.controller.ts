import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller({
  path: 'webhook',
  version: '1',
})
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('receive-events')
  @HttpCode(HttpStatus.OK)
  receiveEvents(
    @Req() request: Request,
    @Headers('x-dt-signature') signature: string,
  ) {
    return this.webhookService.receiveEvents(request.body, signature);
  }
}
