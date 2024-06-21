import { User } from './user.type';

export type LoginSuccess = {
  user: User;
  token: string;
};
