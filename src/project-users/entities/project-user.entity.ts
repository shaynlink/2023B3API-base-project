import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ProjectUser {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public startDate!: Date;

  @Column()
  public endDate!: Date;

  @Column({ type: 'uuid' })
  public projectId!: string;

  @Column({ type: 'uuid' })
  public userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  public project: Project;
}
