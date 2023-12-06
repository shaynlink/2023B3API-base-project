import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EventType, EventTypeEnum } from '../../types/generic';

export class CreateEventDto {
  @IsDateString()
  date!: Date;

  @IsString()
  @IsOptional()
  eventDescription?: string;

  @IsEnum([EventTypeEnum.PaidLeave, EventTypeEnum.RemoteWork])
  eventType!: EventType;
}
