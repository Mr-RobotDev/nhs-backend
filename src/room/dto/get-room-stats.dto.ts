import { IsOptional, IsMongoId } from 'class-validator';
import { GetRoomsQueryDto } from './get-rooms.dto';
import { OmitType } from '@nestjs/mapped-types';

export class GetRoomStatsQueryDto extends OmitType(GetRoomsQueryDto, [
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
}
