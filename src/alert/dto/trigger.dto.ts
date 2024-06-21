import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { DeviceState } from '../../device/enums/device-state.enum';

export class TriggerDto {
  @IsEnum(DeviceState)
  @IsNotEmpty()
  state: DeviceState;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  duration: number;
}
