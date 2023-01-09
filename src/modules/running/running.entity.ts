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
import { User } from '../user/user.entity'
import { RunningType, LocationData } from './running.types'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { UserTraining } from '../userTraining/userTraining.entity'

@Entity()
@ObjectType()
export class Running {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'enum', enum: RunningType })
  @Field(() => RunningType)
  type!: RunningType

  @ManyToOne(() => User, user => user.runnings, { onDelete: 'CASCADE' })
  @Field(() => User)
  user!: User

  @ManyToOne(() => UserTraining, userTraining => userTraining.runnings, {
    onDelete: 'CASCADE',
  })
  @Field(() => UserTraining)
  userTraining!: UserTraining

  @Column({ type: 'simple-json', nullable: true })
  @Field(() => [LocationData], { nullable: true })
  locationsData!: LocationData[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
