import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  Index,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm'
import { UserTraining } from '../userTraining/userTraining.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import {
  WeightTrainingReport,
  RunningTrainingReport,
  FitnessTrainingReport,
} from './trainingReport.types'
import { User } from '../user/user.entity'

@Entity()
@ObjectType()
export class TrainingReport {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'int' })
  @Field(() => Int)
  points!: number

  @Column({ type: 'int' })
  @Field(() => Int)
  kcal!: number

  @Column({ type: 'int' })
  @Field(() => Int)
  duration!: number

  @Field(() => WeightTrainingReport, { nullable: true })
  weightTrainingReport: WeightTrainingReport

  @Field(() => RunningTrainingReport, { nullable: true })
  runningTrainingReport: RunningTrainingReport

  @Field(() => FitnessTrainingReport, { nullable: true })
  fitnessTrainingReport: FitnessTrainingReport

  @OneToOne(() => UserTraining, training => training.report, {
    nullable: true,
  })
  @JoinColumn()
  userTraining!: UserTraining

  @ManyToOne(() => User, user => user.trainingReports)
  user: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
