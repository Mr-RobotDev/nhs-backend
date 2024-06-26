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
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { GetSitesQueryDto } from './dto/get-sites.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  version: '1',
})
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Roles(Role.ADMIN)
  @Post('organizations/:organization/sites')
  createSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Body() createSiteDto: CreateSiteDto,
  ) {
    return this.siteService.createSite(organization, createSiteDto);
  }

  @Get('sites')
  getSites(@Query() query?: GetSitesQueryDto) {
    return this.siteService.getSites(query);
  }

  @Roles(Role.ADMIN)
  @Patch('organizations/:organization/sites/:site')
  updateSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Param('site', IsObjectIdPipe) site: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.siteService.updateSite(organization, site, updateSiteDto);
  }

  @Roles(Role.ADMIN)
  @Delete('organizations/:organization/sites/:site')
  removeSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Param('site', IsObjectIdPipe) site: string,
  ) {
    return this.siteService.removeSite(organization, site);
  }
}
