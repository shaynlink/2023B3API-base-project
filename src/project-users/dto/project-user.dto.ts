import { IsDateString, IsUUID } from 'class-validator';

export class CreateProjectUserDto {
  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;

  @IsUUID(4)
  userId!: string;

  @IsUUID(4)
  projectId!: string;
}
