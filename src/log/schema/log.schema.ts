import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Device } from '../../device/schema/device.schema';
import { Dashboard } from '../../dashboard/schema/dashboard.schema';
import { Action, ActionValues } from '../enums/action.enum';
import { Page, PageValues } from '../enums/page.enum';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';

@Schema({
  timestamps: true,
})
export class Log extends Document {
  @Prop({
    type: String,
    required: true,
    enum: ActionValues,
  })
  action: Action;

  @Prop({
    type: String,
    enum: PageValues,
  })
  page: Page;

  @Prop({
    type: String,
  })
  userAgent?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Dashboard.name,
    index: true,
    sparse: true,
  })
  dashboard?: Dashboard;

  @Prop({
    type: Types.ObjectId,
    ref: Device.name,
    index: true,
    sparse: true,
  })
  device?: Device;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
    index: true,
  })
  user: User;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.plugin(toJSON);
LogSchema.plugin(paginate);
LogSchema.plugin(paginatedAggregation);
