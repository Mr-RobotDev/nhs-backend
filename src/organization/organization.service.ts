import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from './schema/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { GetOrganizationsQueryDto } from './dto/get-organizations.dto';
import { Result } from '../common/interfaces/result.interface';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: PaginatedModel<Organization>,
  ) {}

  createOrganization(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationModel.create(createOrganizationDto);
  }

  getOrganizations(
    query: GetOrganizationsQueryDto,
  ): Promise<Result<Organization>> {
    const { page, limit, search } = query;
    return this.organizationModel.paginate(
      {
        ...(search && { name: { $regex: search, $options: 'i' } }),
      },
      { page, limit, projection: '-createdAt' },
    );
  }

  async getOrganization(id: string): Promise<Organization> {
    const organization = await this.organizationModel
      .findById(id)
      .select('-createdAt');
    if (!organization) {
      throw new NotFoundException(`Organization #${id} not found`);
    }
    return organization;
  }

  async updateOrganization(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.organizationModel.findByIdAndUpdate(
      id,
      updateOrganizationDto,
      { new: true, projection: '-createdAt' },
    );
    if (!organization) {
      throw new NotFoundException(`Organization #${id} not found`);
    }
    return organization;
  }

  async removeOrganization(id: string): Promise<Organization> {
    const organization = await this.organizationModel.findByIdAndDelete(id);

    if (!organization) {
      throw new NotFoundException(`Organization #${id} not found`);
    }
    return organization;
  }
}
