import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column,
  Generated,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm'
import { UserProgram } from '../userProgram/userProgram.entity'
import { Training } from '../training/training.entity'
import { TrainingReport } from '../trainingReport/trainingReport.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { UserTrainingStatus, FeedbackData } from './userTraining.types'
import { Running } from '../running/running.entity'

@Entity()
@ObjectType()
export class UserTraining {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({
    type: 'enum',
    enum: UserTrainingStatus,
    default: UserTrainingStatus.PENDING,
  })
  @Field(() => UserTrainingStatus)
  status: UserTrainingStatus

  @Column({ type: 'float', nullable: true })
  duration: number

  @Column({ type: 'boolean', nullable: true })
  finisher: boolean

  @Column({ type: 'enum', enum: FeedbackData, nullable: true })
  feedback: FeedbackData

  @ManyToOne(() => UserProgram, userProgram => userProgram.userTrainings, {
    onDelete: 'CASCADE',
  })
  userProgram!: UserProgram

  @ManyToOne(() => Training, training => training.userTrainings)
  @Field(() => Training)
  training!: Training

  @OneToMany(() => Running, running => running.userTraining)
  @Field(() => [Running], { nullable: true })
  runnings!: Running[]

  @OneToOne(() => TrainingReport, trainingReport => trainingReport.userTraining)
  @Field(() => TrainingReport, { nullable: true })
  report: TrainingReport

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
