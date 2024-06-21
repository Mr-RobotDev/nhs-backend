import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Device } from '../../device/schema/device.schema';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import {
  DeviceState,
  DeviceStateValues,
} from '../../device/enums/device-state.enum';

@Schema({
  timestamps: true,
})
export class Event extends Document {
  @Prop({
    type: String,
    required: true,
    enum: DeviceStateValues,
  })
  state?: DeviceState;

  @Prop({
    type: Types.ObjectId,
    ref: Device.name,
    required: true,
    index: true,
  })
  device: Device;

  @Prop({
    type: Date,
  })
  createdAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.plugin(toJSON);
EventSchema.plugin(paginate);
EventSchema.plugin(paginatedAggregation);
