import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
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
