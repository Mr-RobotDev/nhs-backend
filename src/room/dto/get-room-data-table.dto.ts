import {
  IsOptional,
  IsBooleanString,
  IsDate,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { GetRoomsQueryDto } from './get-rooms.dto';
import { ToDate } from '../../common/transformers/to-date.transformer';
import { OmitType } from '@nestjs/mapped-types';

export class GetRoomDataTableQueryDto extends OmitType(GetRoomsQueryDto, [
  'search',
] as const) {
  @IsOptional()
  @IsMongoId({ each: true })
  organization?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  site?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  building?: string[];

  @IsOptional()
  @IsBooleanString()
  includeWeekends?: boolean;

  @IsDate()
  @ToDate()
  @IsNotEmpty()
  from: Date;

  @IsDate()
  @ToDate()
  @IsNotEmpty()
  to: Date;
}
