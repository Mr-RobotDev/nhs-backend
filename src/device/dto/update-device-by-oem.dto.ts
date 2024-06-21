import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DeviceState } from '../enums/device-state.enum';

export class UpdateDeviceByOem {
  @IsEnum(DeviceState)
  @IsOptional()
  state?: string;

  @IsNumber()
  @IsOptional()
  signalStrength?: number;

  @IsBoolean()
  @IsOptional()
  isOffline?: boolean;
}
