import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column,
  Generated,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Training } from '../training/training.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { GroupType } from './group.types'

@Entity()
@ObjectType()
export class Group {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  name!: string

  @Column({ type: 'varchar', nullable: true })
  @Field()
  nameEn: string

  @Column({ type: 'int' })
  @Field(() => Int)
  position!: number

  @Column({ type: 'int' })
  @Field(() => Int)
  restTime!: number

  @Column({ type: 'enum', enum: GroupType })
  @Field(() => GroupType)
  type!: GroupType

  @ManyToOne(() => Training, training => training.groups, {
    onDelete: 'CASCADE',
  })
  training: Training

  @OneToMany(() => GroupExercise, groupExercise => groupExercise.exercise)
  @Field(() => [GroupExercise])
  groupExercises: GroupExercise[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
