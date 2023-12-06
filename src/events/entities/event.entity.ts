import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  EventStatus,
  EventStatusEnum,
  EventType,
  EventTypeEnum,
} from '../../types/generic';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public date!: Date;

  @Column({ enum: EventStatusEnum })
  public eventStatus?: EventStatus;

  @Column({ enum: EventTypeEnum })
  public eventType!: EventType;

  @Column()
  public eventDescription?: string;

  @Column({ type: 'uuid' })
  public userId!: string;
}
