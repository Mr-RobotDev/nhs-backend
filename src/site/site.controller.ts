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
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  path: 'organizations/:organization/sites',
  version: '1',
})
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Roles(Role.ADMIN)
  @Post()
  createSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Body() createSiteDto: CreateSiteDto,
  ) {
    return this.siteService.createSite(organization, createSiteDto);
  }

  @Get()
  getSites(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Query() paginationDto?: PaginationQueryDto,
  ) {
    return this.siteService.getSites(organization, paginationDto);
  }

  @Get(':site')
  getSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Param('site', IsObjectIdPipe) site: string,
  ) {
    return this.siteService.getSite(organization, site);
  }

  @Roles(Role.ADMIN)
  @Patch(':site')
  updateSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Param('site', IsObjectIdPipe) site: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.siteService.updateSite(organization, site, updateSiteDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':site')
  removeSite(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Param('site', IsObjectIdPipe) site: string,
  ) {
    return this.siteService.removeSite(organization, site);
  }
}
