import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Device } from '../../device/schema/device.schema';
import { Dashboard } from '../../dashboard/schema/dashboard.schema';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';

@Schema({
  timestamps: true,
})
export class Card extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: Number,
    required: true,
  })
  x: number;

  @Prop({
    type: Number,
    required: true,
  })
  y: number;

  @Prop({
    type: Number,
    required: true,
  })
  rows: number;

  @Prop({
    type: Number,
    required: true,
  })
  cols: number;

  @Prop({
    type: [Types.ObjectId],
    ref: Device.name,
    required: true,
    index: true,
  })
  devices: Device[];

  @Prop({
    type: Types.ObjectId,
    ref: Dashboard.name,
    required: true,
    index: true,
  })
  dashboard: Dashboard;
}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.plugin(toJSON);
CardSchema.plugin(paginate);
CardSchema.plugin(paginatedAggregation);
