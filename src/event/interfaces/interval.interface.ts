import { DeviceState } from '../../device/enums/device-state.enum';

export interface Interval {
  state: DeviceState;
  from: Date;
  to: Date;
}
