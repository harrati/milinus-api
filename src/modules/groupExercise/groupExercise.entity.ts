import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column,
  Generated,
  ManyToOne,
} from 'typeorm'
import { Group } from '../group/group.entity'
import { Exercise } from '../exercise/exercise.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { ExerciseFormat } from '../exercise/exercise.types'

@Entity()
@ObjectType()
export class GroupExercise {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'int' })
  @Field(() => Int)
  position!: number

  @Column({ type: 'int' })
  @Field(() => Int)
  value!: number

  @Field(() => Int)
  weight: number

  @Field(() => Int, { nullable: true })
  difficulty!: number

  @Column({ type: 'enum', enum: ExerciseFormat, nullable: true })
  @Field(() => ExerciseFormat)
  format!: ExerciseFormat

  @ManyToOne(() => Group, group => group.groupExercises, {
    onDelete: 'CASCADE',
  })
  @Field(() => Group)
  group!: Group

  @ManyToOne(() => Exercise, exercise => exercise.groupExercises)
  @Field(() => Exercise)
  exercise!: Exercise

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
