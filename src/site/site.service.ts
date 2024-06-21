import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Site } from './schema/site.schema';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: PaginatedModel<Site>,
  ) {}

  async createSite(createSiteDto: CreateSiteDto) {
    const site = await this.siteModel.create({
      ...createSiteDto,
    });
    return site;
  }

  async getSites(paginationDto: PaginationQueryDto) {
    const { page, limit } = paginationDto;
    return this.siteModel.paginate(
      {},
      {
        page,
        limit,
      },
    );
  }

  async getSite(id: string) {
    const site = await this.siteModel.findById(id);
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }

  async updateSite(id: string, updateSiteDto: UpdateSiteDto) {
    const site = await this.siteModel.findByIdAndUpdate(id, updateSiteDto, {
      new: true,
    });
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }

  async removeSite(id: string) {
    console.log(id);
    const site = await this.siteModel.findByIdAndDelete(id);
    console.log(site);
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }
}
