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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  createOrganization(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.createOrganization(createOrganizationDto);
  }

  @Get()
  getOrganizations(@Query() paginationDto: PaginationQueryDto) {
    return this.organizationService.getOrganizations(paginationDto);
  }

  @Get(':organization')
  getOrganization(@Param('organization', IsObjectIdPipe) organization: string) {
    return this.organizationService.getOrganization(organization);
  }

  @Patch(':organization')
  updateOrganization(
    @Param('organization', IsObjectIdPipe) organization: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.updateOrganization(
      organization,
      updateOrganizationDto,
    );
  }

  @Delete(':organization')
  removeOrganization(
    @Param('organization', IsObjectIdPipe) organization: string,
  ) {
    return this.organizationService.removeOrganization(organization);
  }
}
