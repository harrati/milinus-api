import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column,
  Generated,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm'
import { Training } from '../training/training.entity'
import { UserProgram } from '../userProgram/userProgram.entity'
import { ToggleStatus } from '../../utils/types'
import { Evaluation } from '../evaluation/evaluation.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import {
  UserObjectives,
  UserRunningCapacities,
  UserTrainingFrequencies,
  BodyAreas,
} from '../profile/profile.types'
import { UserGenders, UserSubscriptionStatus } from '../user/user.types'
import { System } from '../system/system.entity'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'

@Entity()
@ObjectType()
export class Program {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'int', unique: true, nullable: true })
  secretId: number

  @Column({ type: 'varchar' })
  @Field()
  name!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  nameEn: string

  @Field(() => String)
  nameTrans: string

  @Field(() => String)
  descriptionTrans: string

  @Column({ type: 'varchar' })
  @Field()
  pictureUrl!: string

  @Column({ type: 'varchar' })
  @Field()
  description!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  descriptionEn: string

  @Column({ type: 'enum', enum: UserTrainingFrequencies, nullable: true })
  @Field(() => UserTrainingFrequencies, { nullable: true })
  trainingFrequency: UserTrainingFrequencies

  @Column({ type: 'enum', enum: UserRunningCapacities })
  @Field(() => UserRunningCapacities)
  runningCapacity!: UserRunningCapacities

  @Column({ type: 'enum', enum: ToggleStatus, default: ToggleStatus.ACTIVE })
  @Field(() => ToggleStatus)
  status!: ToggleStatus

  @Column({ type: 'enum', enum: UserGenders, default: UserGenders.NON_BINARY })
  @Field(() => UserGenders)
  targetGender!: UserGenders

  @Column({
    type: 'enum',
    enum: UserSubscriptionStatus,
    default: UserSubscriptionStatus.FREE,
  })
  @Field(() => UserSubscriptionStatus)
  offer!: UserSubscriptionStatus

  @Column({ type: 'enum', enum: UserObjectives })
  @Field(() => UserObjectives)
  objective!: UserObjectives

  @Column({
    type: 'enum',
    enum: UserTrainingFrequencies,
    default: UserTrainingFrequencies.NOOB,
    nullable: true,
  })
  @Field(() => UserTrainingFrequencies, { nullable: true })
  difficulty: UserTrainingFrequencies

  @Column({ type: 'int', nullable: true })
  @Field(() => Int)
  duration: number

  @Field(() => [BodyAreas], { nullable: true })
  bodyAreas: BodyAreas[]

  @ManyToOne(() => System, system => system.programs)
  @Field(() => System)
  system!: System

  @OneToOne(() => Evaluation, evaluation => evaluation.program, {
    nullable: true,
  })
  @JoinColumn()
  evaluation!: Evaluation

  @OneToMany(() => Training, training => training.program)
  @Field(() => [Training])
  trainings: Training[]

  @OneToMany(() => TrainingGroup, trainingGroup => trainingGroup.program)
  @Field(() => [TrainingGroup])
  trainingGroups!: TrainingGroup[]

  @OneToMany(() => UserProgram, userProgram => userProgram.program)
  users!: UserProgram[]

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
