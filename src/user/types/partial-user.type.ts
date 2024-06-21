import { User } from '../schema/user.schema';

export type PartialUser = {
  user: Partial<User>;
};
