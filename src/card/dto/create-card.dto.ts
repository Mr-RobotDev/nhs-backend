import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  x: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  y: number;

  @IsInt()
  @IsNotEmpty()
  @Min(2)
  @Max(4)
  rows: number;

  @IsInt()
  @IsNotEmpty()
  @Min(2)
  @Max(4)
  cols: number;

  @IsArray()
  @ArrayNotEmpty()
  devices: string[];
}
