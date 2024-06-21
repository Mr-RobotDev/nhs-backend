import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  DeviceState,
  DeviceStateValues,
} from '../../device/enums/device-state.enum';

@Schema({
  _id: false,
  versionKey: false,
})
export class Trigger extends Document {
  @Prop({
    type: String,
    required: true,
    enum: DeviceStateValues,
  })
  state: DeviceState;

  @Prop({
    type: Number,
    required: true,
  })
  duration: number;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger);
