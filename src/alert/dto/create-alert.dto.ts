import {
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TriggerDto } from './trigger.dto';
import { ScheduleType } from '../../common/enums/schedule-type.enum';
import { WeekDay } from '../../common/enums/week-day.enum';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  device: string;

  @ValidateNested()
  @Type(() => TriggerDto)
  trigger: TriggerDto;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsEnum(ScheduleType)
  @IsNotEmpty()
  scheduleType: ScheduleType;

  @ValidateIf((o) => o.scheduleType === ScheduleType.CUSTOM)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(WeekDay, { each: true })
  weekdays: WeekDay[];
}
