import {
  IsOptional,
  IsBooleanString,
  IsDate,
  IsMongoId,
} from 'class-validator';
import { GetRoomsQueryDto } from './get-rooms.dto';
import { ToDate } from '../../common/transformers/to-date.transformer';

export class GetRoomStatsQueryDto extends GetRoomsQueryDto {
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

  @IsOptional()
  @IsDate()
  @ToDate()
  from?: Date;

  @IsOptional()
  @IsDate()
  @ToDate()
  to?: Date;
}
