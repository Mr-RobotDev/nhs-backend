import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Organization, OrganizationValues } from '../enums/organization.enum';
import { Role, RoleValues } from '../../common/enums/role.enum';
import toJSON from '../../common/plugins/toJSON.plugin';
import {
  paginate,
  paginatedAggregation,
} from '../../common/plugins/pagination.plugin';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: RoleValues,
    default: Role.USER,
  })
  role: Role;

  @Prop({
    type: String,
  })
  profile?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Prop({
    type: String,
    required: true,
    enum: OrganizationValues,
  })
  organization: Organization;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

UserSchema.index({
  firstName: 1,
  lastName: 1,
  email: 1,
});

UserSchema.plugin(toJSON);
UserSchema.plugin(paginate);
UserSchema.plugin(paginatedAggregation);
