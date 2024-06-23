import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../enums/device-type.enum';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  oem: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsEnum(DeviceType)
  @IsNotEmpty()
  type: DeviceType;

  @IsMongoId()
  @IsNotEmpty()
  organization: string;

  @IsMongoId()
  @IsNotEmpty()
  site: string;

  @IsMongoId()
  @IsNotEmpty()
  building: string;

  @IsMongoId()
  @IsNotEmpty()
  floor: string;

  @IsMongoId()
  @IsNotEmpty()
  room: string;
}
