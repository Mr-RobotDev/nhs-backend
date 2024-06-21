import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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
  })
  name: string;

  @Prop({
    type: String,
  })
  description?: string;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.plugin(toJSON);
SiteSchema.plugin(paginate);
SiteSchema.plugin(paginatedAggregation);
