import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetDevicesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  organization?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  site?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  building?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  floor?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  room?: string[];
}
