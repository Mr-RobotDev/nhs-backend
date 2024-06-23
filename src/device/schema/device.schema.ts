import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Organization } from '../../organization/schema/organization.schema';
import { Site } from '../../site/schema/site.schema';
import { Building } from '../../building/schema/building.schema';
import { Floor } from '../../floor/schema/floor.schema';
import { Room } from '../../room/schema/room.schema';
import { DeviceType, DeviceTypeValues } from '../enums/device-type.enum';
import { DeviceState, DeviceStateValues } from '../enums/device-state.enum';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';

@Schema({
  timestamps: true,
})
export class Device extends Document {
  @Prop({
    type: String,
    unique: true,
    index: true,
    required: true,
  })
  oem?: string;

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
    enum: DeviceTypeValues,
  })
  type: DeviceType;

  @Prop({
    type: String,
    enum: DeviceStateValues,
    default: DeviceState.NO_MOTION_DETECTED,
  })
  state: DeviceState;

  @Prop({
    type: Number,
    default: 100,
  })
  signalStrength: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  isOffline: boolean;

  @Prop({
    type: Date,
  })
  updatedAt: Date;

  @Prop({
    type: String,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organization: Organization;

  @Prop({
    type: String,
    ref: Site.name,
    required: true,
    index: true,
  })
  site: Site;

  @Prop({
    type: String,
    ref: Building.name,
    required: true,
    index: true,
  })
  building: Building;

  @Prop({
    type: String,
    ref: Floor.name,
    required: true,
    index: true,
  })
  floor: Floor;

  @Prop({
    type: String,
    ref: Room.name,
    required: true,
    index: true,
  })
  room: Room;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ oem: 1, name: 1 });

DeviceSchema.plugin(toJSON);
DeviceSchema.plugin(paginate);
DeviceSchema.plugin(paginatedAggregation);
