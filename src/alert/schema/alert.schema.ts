import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Trigger, TriggerSchema } from './trigger.schema';
import { Device } from '../../device/schema/device.schema';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';
import {
  ScheduleType,
  ScheduleTypeValues,
} from '../../common/enums/schedule-type.enum';
import { WeekDay, WeekDayValues } from '../../common/enums/week-day.enum';

@Schema({
  timestamps: true,
})
export class Alert extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: [String],
    required: true,
  })
  recipients: string[];

  @Prop({
    type: TriggerSchema,
    required: true,
  })
  trigger: Trigger;

  @Prop({
    type: String,
    required: true,
    enum: ScheduleTypeValues,
  })
  scheduleType: ScheduleType;

  @Prop({
    type: [String],
    enum: WeekDayValues,
    required: function () {
      return this.scheduleType === ScheduleType.CUSTOM;
    },
  })
  weekdays: WeekDay[];

  @Prop({
    type: Boolean,
    default: true,
  })
  enabled: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: Device.name,
    required: true,
  })
  device: Device;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

AlertSchema.index({ device: 1 }, { unique: true });

AlertSchema.plugin(toJSON);
AlertSchema.plugin(paginate);
AlertSchema.plugin(paginatedAggregation);
