import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Site } from './schema/site.schema';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { GetSitesQueryDto } from './dto/get-sites.dto';
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
    return this.siteModel.create({
      ...createSiteDto,
      organization,
    });
  }

  async getSites(query?: GetSitesQueryDto): Promise<Result<Site>> {
    const { page, limit, search, organization } = query;
    const organizations = Array.isArray(organization)
      ? organization
      : [organization];

    return this.siteModel.paginate(
      {
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(organization && { organization: { $in: organizations } }),
      },
      {
        page,
        limit,
        projection: '-organization -createdAt',
      },
    );
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
