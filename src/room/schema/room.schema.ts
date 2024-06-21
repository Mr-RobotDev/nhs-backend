import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Floor } from '../../floor/schema/floor.schema';

@Schema({
  timestamps: true,
})
export class Room extends Document {
  @Prop({
    type: String,
    required: true,
  })
  code: string;

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
    type: String,
    required: true,
  })
  function: string;

  @Prop({
    type: Number,
    required: true,
  })
  netUseableArea: number;

  @Prop({
    type: String,
    required: true,
  })
  department: string;

  @Prop({
    type: String,
    required: true,
  })
  division: string;

  @Prop({
    type: String,
    required: true,
  })
  cluster: string;

  @Prop({
    type: String,
    required: true,
  })
  clusterDescription: string;

  @Prop({
    type: String,
    required: true,
  })
  operationHours: string;

  @Prop({
    type: Number,
    required: true,
  })
  hoursPerDay: number;

  @Prop({
    type: Number,
    default: 0,
  })
  occupancy: number;

  @Prop({
    type: Types.ObjectId,
    ref: Floor.name,
    required: true,
    index: true,
  })
  floor: Floor;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.plugin(toJSON);
RoomSchema.plugin(paginate);
RoomSchema.plugin(paginatedAggregation);
