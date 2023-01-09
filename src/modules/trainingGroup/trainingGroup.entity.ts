import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm'

import { Field, ObjectType, ID } from '@nestjs/graphql'
import { Training } from '../training/training.entity'
import { Program } from '../program/program.entity'

@Entity()
@ObjectType()
export class TrainingGroup {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  default!: boolean

  @Field({ nullable: true })
  difficulty?: number

  @OneToMany(() => Training, training => training.trainingGroup)
  @Field(() => [Training])
  trainings!: Training[]

  @ManyToOne(() => Program, program => program.trainingGroups, {
    onDelete: 'CASCADE',
  })
  program: Program

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
