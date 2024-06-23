import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Building } from '../../building/schema/building.schema';

@Schema({
  timestamps: true,
})
export class Floor extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  code: string;

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
    type: Types.ObjectId,
    ref: Building.name,
    required: true,
    index: true,
  })
  building: Building;
}

export const FloorSchema = SchemaFactory.createForClass(Floor);

FloorSchema.plugin(toJSON);
FloorSchema.plugin(paginate);
FloorSchema.plugin(paginatedAggregation);
