import { Transform } from 'class-transformer';

export function ToDate() {
  return Transform(({ value }) => (value ? new Date(value) : value));
}
