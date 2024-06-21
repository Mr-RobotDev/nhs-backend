import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Action } from '../enums/action.enum';
import { Page } from '../enums/page.enum';

export class CreateLogDto {
  @IsEnum(Action)
  @IsString()
  @IsNotEmpty()
  action: Action;

  @IsEnum(Action)
  @IsString()
  page?: Page;

  @IsMongoId()
  dashboard?: string;

  @IsMongoId()
  device?: string;

  @IsString()
  userAgent?: string;
}
