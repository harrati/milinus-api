import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { Planet } from './planet.entity'
import { User } from '../user/user.entity'

@Entity()
export class UserPlanet {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  uuid!: string

  @ManyToOne(() => Planet, planet => planet.userPlanets)
  planet!: Planet

  @ManyToOne(() => User, user => user.userPlanets, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
