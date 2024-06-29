import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetDevicesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

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
  @IsMongoId({ each: true })
  floor?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  room?: string[];
}
