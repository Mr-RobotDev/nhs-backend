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
export class Dashboard extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  cardsCount?: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  devicesCount?: number;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);

DashboardSchema.plugin(toJSON);
DashboardSchema.plugin(paginate);
DashboardSchema.plugin(paginatedAggregation);
