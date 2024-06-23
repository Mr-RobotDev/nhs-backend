import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Organization } from '../../organization/schema/organization.schema';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';

@Schema({
  timestamps: true,
})
export class Site extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    trim: true,
  })
  description?: string;

  @Prop({
    type: String,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organization: Organization;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.plugin(toJSON);
SiteSchema.plugin(paginate);
SiteSchema.plugin(paginatedAggregation);
