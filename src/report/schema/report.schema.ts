import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Dashboard } from '../../dashboard/schema/dashboard.schema';
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
import { TimeFrame } from '../enums/timeframe.enum';

@Schema({
  timestamps: true,
})
export class Report extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  timeframe: TimeFrame;

  @Prop({
    type: [String],
    required: true,
  })
  recipients: string[];

  @Prop({
    type: String,
    required: true,
    enum: ScheduleTypeValues,
  })
  scheduleType: ScheduleType;

  @Prop({
    type: Boolean,
    default: true,
  })
  enabled: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: Dashboard.name,
    required: true,
    index: true,
  })
  dashboard: Dashboard;

  @Prop({
    type: [String],
    enum: WeekDayValues,
    required: function (this: Report) {
      return this.scheduleType === ScheduleType.CUSTOM;
    },
  })
  weekdays: WeekDay[];

  @Prop({
    type: [String],
    required: true,
  })
  times: string[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.plugin(toJSON);
ReportSchema.plugin(paginate);
ReportSchema.plugin(paginatedAggregation);
