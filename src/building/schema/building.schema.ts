import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import { Document, Types } from 'mongoose';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Site } from '../../site/schema/site.schema';

@Schema({
  timestamps: true,
})
export class Building extends Document {
  @Prop({
    type: Number,
    required: true,
  })
  code: number;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
  })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Site.name,
    required: true,
    index: true,
  })
  site: Site;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);

BuildingSchema.plugin(toJSON);
BuildingSchema.plugin(paginate);
BuildingSchema.plugin(paginatedAggregation);
