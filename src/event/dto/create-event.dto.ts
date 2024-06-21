import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { DeviceState } from '../../device/enums/device-state.enum';

export class CreateEventDto {
  @IsMongoId()
  @IsNotEmpty()
  device: string;

  @IsEnum(DeviceState)
  @IsNotEmpty()
  state?: DeviceState;
}
