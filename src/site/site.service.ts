import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Site } from './schema/site.schema';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: PaginatedModel<Site>,
  ) {}

  async createSite(
    organization: string,
    createSiteDto: CreateSiteDto,
  ): Promise<Site> {
    const site = await this.siteModel.create({
      ...createSiteDto,
      organization,
    });
    return site;
  }

  async getSites(
    organization: string,
    paginationDto: PaginationQueryDto,
  ): Promise<Result<Site>> {
    const { page, limit } = paginationDto;
    return this.siteModel.paginate(
      {
        organization,
      },
      {
        page,
        limit,
        projection: '-organization -createdAt',
      },
    );
  }

  async getSite(organization: string, id: string): Promise<Site> {
    const site = await this.siteModel
      .findOne({
        _id: id,
        organization,
      })
      .select('-organization -createdAt');
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }

  async updateSite(
    organization: string,
    id: string,
    updateSiteDto: UpdateSiteDto,
  ): Promise<Site> {
    const site = await this.siteModel.findOneAndUpdate(
      {
        _id: id,
        organization,
      },
      updateSiteDto,
      {
        new: true,
        projection: '-organization -createdAt',
      },
    );
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }

  async removeSite(organization: string, id: string): Promise<Site> {
    const site = await this.siteModel.findOneAndDelete({
      _id: id,
      organization,
    });
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }
}
