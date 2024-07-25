import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import { Floor } from '../../floor/schema/floor.schema';
import { Organization } from 'src/organization/schema/organization.schema';
import { Site } from 'src/site/schema/site.schema';
import { Building } from 'src/building/schema/building.schema';

@Schema({
  timestamps: true,
})
export class Room extends Document {
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
    type: String,
    required: true,
    trim: true,
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
    trim: true,
  })
  department: string;

  @Prop({
    type: String,
    trim: true,
  })
  subDepartment?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  division: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  cluster: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  clusterDescription: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
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
    ref: Organization.name,
    required: true,
    index: true,
  })
  organization: Organization;

  @Prop({
    type: Types.ObjectId,
    ref: Site.name,
    required: true,
    index: true,
  })
  site: Site;

  @Prop({
    type: Types.ObjectId,
    ref: Building.name,
    required: true,
    trim: true,
  })
  building: Building;

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
