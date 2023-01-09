import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm'
import { Program } from '../program/program.entity'
import { Exercise } from '../exercise/exercise.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

@Entity()
@ObjectType()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'int' })
  @Field(() => Int)
  duration!: number

  @OneToOne(() => Program, program => program.evaluation)
  program!: Program

  @ManyToOne(() => Exercise, exercise => exercise.evaluations)
  @Field(() => Exercise)
  exercise!: Exercise

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
