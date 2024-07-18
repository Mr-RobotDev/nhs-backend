import { IsOptional, IsBooleanString, IsDate } from 'class-validator';
import { GetRoomsQueryDto } from './get-rooms.dto';
import { ToDate } from '../../common/transformers/to-date.transformer';

export class GetRoomStatsQueryDto extends GetRoomsQueryDto {
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
