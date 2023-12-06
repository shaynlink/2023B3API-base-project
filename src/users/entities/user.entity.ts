import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Role, RoleEnum } from '../../types/generic';

@Entity()
@Unique(['username', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public username!: string;

  @Column()
  public email!: string;

  @Column({ select: false })
  public password!: string;

  @Column({ enum: RoleEnum, default: RoleEnum.Employee })
  public role!: Role;
}
