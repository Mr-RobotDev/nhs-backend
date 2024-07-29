import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsMongoId,
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
  @IsOptional()
  subDepartment: string;

  @IsString()
  @IsOptional()
  division: string;

  @IsString()
  @IsOptional()
  cluster: string;

  @IsString()
  @IsOptional()
  clusterDescription: string;

  @IsString()
  @IsNotEmpty()
  operationHours: string;

  @IsInt()
  @IsNotEmpty()
  hoursPerDay: number;

  @IsInt()
  @IsOptional()
  maxDeskOccupation: number;

  @IsInt()
  @IsOptional()
  numWorkstations: number;

  @IsMongoId()
  @IsNotEmpty()
  organization: string;

  @IsMongoId()
  @IsNotEmpty()
  site: string;

  @IsMongoId()
  @IsNotEmpty()
  building: string;
}
