import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  function: string;

  @IsNumber()
  @IsNotEmpty()
  netUseableArea: number;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  division: string;

  @IsString()
  @IsNotEmpty()
  cluster: string;

  @IsString()
  @IsNotEmpty()
  clusterDescription: string;

  @IsString()
  @IsNotEmpty()
  operationHours: string;

  @IsInt()
  @IsNotEmpty()
  hoursPerDay: number;
}
