import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public name!: string;

  @Column({ type: 'uuid' })
  public referringEmployeeId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referringEmployeeId' })
  public referringEmployee: User;
}
