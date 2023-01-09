import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { User } from '../user/user.entity'
import { RequestStatus, RequestCategory } from './userRequest.types'

@Entity()
@ObjectType()
export class UserRequest {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @ManyToOne(() => User, user => user.pushTokens, { onDelete: 'CASCADE' })
  @Field(() => User)
  user!: User

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  @Field(() => RequestStatus)
  status: RequestStatus

  @Column({
    type: 'enum',
    enum: RequestCategory,
  })
  @Field(() => RequestCategory)
  category: RequestCategory

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
