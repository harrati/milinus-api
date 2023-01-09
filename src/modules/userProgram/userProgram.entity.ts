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
  BeforeInsert,
  JoinColumn,
} from 'typeorm'
import { Program } from '../program/program.entity'
import { User } from '../user/user.entity'
import { UserTraining } from '../userTraining/userTraining.entity'
import { Nullable } from '../../utils/types'
import { UserEvaluation } from '../userEvaluation/userEvaluation.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { UserTrainingFrequencies } from '../profile/profile.types'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'
import { UserProgramScheduleToFrequencyMapper } from '../../utils/enumMapper'

@Entity()
@ObjectType()
export class UserProgram {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @ManyToOne(() => Program, program => program.users)
  @Field(() => Program)
  program!: Program

  @ManyToOne(() => User, user => user.programs, { onDelete: 'CASCADE' })
  user!: User

  // A user can pick up a program he abandoned and it has to have the same frequency than when he started it
  @Column({ type: 'enum', enum: UserTrainingFrequencies })
  trainingFrequency: UserTrainingFrequencies

  @ManyToOne(() => TrainingGroup)
  @JoinColumn()
  trainingGroup: TrainingGroup

  @OneToMany(() => UserTraining, userTraining => userTraining.userProgram)
  userTrainings!: UserTraining[]

  @Field(() => [[UserTraining]], { name: 'userTrainings' })
  userTrainingsPerWeek: UserTraining[][]

  @Field(() => Int, { nullable: true })
  currentTrainingIndex?: number

  @Field(() => [Int])
  evaluationSchedule: number[]

  @OneToMany(() => UserEvaluation, userEvaluation => userEvaluation.userProgram)
  @Field(() => [UserEvaluation])
  userEvaluations!: UserEvaluation[]

  @Field(() => Boolean)
  isEvaluationDue: boolean

  @Column({ type: 'date', nullable: true })
  completedAt?: Nullable<Date>

  @Column({ type: 'date', nullable: true })
  stoppedAt?: Nullable<Date>

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date

  @BeforeInsert()
  saveTrainingFrequency() {
    this.trainingFrequency =
      UserProgramScheduleToFrequencyMapper[this.user.programSchedule]
  }
}
