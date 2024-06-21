import { IsDate, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ToDate } from '../../common/transformers/to-date.transformer';

export class GetLogsQueryDto extends PaginationQueryDto {
  @IsDate()
  @ToDate()
  @IsNotEmpty()
  from?: Date;

  @IsDate()
  @ToDate()
  @IsNotEmpty()
  to?: Date;

  @IsOptional()
  @IsMongoId()
  user?: string;

  @IsOptional()
  @IsMongoId()
  device?: string;
}
