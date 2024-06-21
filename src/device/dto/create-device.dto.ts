import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../enums/device-type.enum';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  oem: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsEnum(DeviceType)
  @IsNotEmpty()
  type: DeviceType;
}
