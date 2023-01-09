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
import { UserProgram } from '../userProgram/userProgram.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

@Entity()
@ObjectType()
export class UserEvaluation {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'int' })
  @Field(() => Int)
  result!: number

  @ManyToOne(() => UserProgram, program => program.userEvaluations)
  userProgram!: UserProgram

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
