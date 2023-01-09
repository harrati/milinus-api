import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column,
  Generated,
  OneToMany,
} from 'typeorm'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { ToggleStatus } from '../../utils/types'
import { Evaluation } from '../evaluation/evaluation.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import {
  ExerciseFormat,
  ExerciseTypes,
  ExerciseReferences,
  DifficultyScale,
} from './exercise.types'
import {
  TrainingEquipments,
  UserTrainingFrequencies,
  BodyAreas,
} from '../profile/profile.types'

@Entity()
@ObjectType()
export class Exercise {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  secretId: string

  @Column('varchar')
  @Field()
  name!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  nameEn: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  descriptionEn: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  explanationEn!: string

  @Field(() => String, { nullable: true })
  nameTrans: string

  @Field(() => String, { nullable: true })
  descriptionTrans: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  pictureUrl?: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  gifUrl?: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  videoUrl?: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  description?: string

  @Column({ type: 'varchar' })
  @Field()
  explanation!: string

  @Column({
    type: 'enum',
    array: true,
    enum: TrainingEquipments,
    default: [],
  })
  @Field(() => [TrainingEquipments])
  equipments!: TrainingEquipments[]

  @Column({
    type: 'enum',
    enum: UserTrainingFrequencies,
    default: UserTrainingFrequencies.NOOB,
  })
  @Field(() => UserTrainingFrequencies)
  difficulty: UserTrainingFrequencies

  @Column({ type: 'enum', enum: BodyAreas, nullable: true })
  @Field(() => BodyAreas, { nullable: true })
  primaryBodyArea?: BodyAreas

  @Column({ type: 'enum', enum: BodyAreas, nullable: true })
  @Field(() => BodyAreas, { nullable: true })
  secondaryBodyArea?: BodyAreas

  @Column({ type: 'enum', enum: BodyAreas, nullable: true })
  @Field(() => BodyAreas, { nullable: true })
  tertiaryBodyArea?: BodyAreas

  @Column({ type: 'enum', enum: ExerciseFormat, nullable: true })
  @Field(() => ExerciseFormat)
  format!: ExerciseFormat

  @Column({ type: 'enum', enum: ExerciseFormat, nullable: true })
  @Field(() => ExerciseFormat, { nullable: true })
  secondaryFormat!: ExerciseFormat

  @Column({ type: 'enum', enum: ExerciseTypes })
  @Field(() => ExerciseTypes)
  type!: ExerciseTypes

  @Column({ type: 'enum', enum: ExerciseReferences, nullable: true })
  @Field(() => ExerciseReferences, { nullable: true })
  reference: ExerciseReferences

  @Column({ type: 'enum', enum: ToggleStatus, default: ToggleStatus.ACTIVE })
  @Field(() => ToggleStatus)
  status!: ToggleStatus

  @Column({ type: 'simple-json', nullable: true })
  @Field(() => [DifficultyScale])
  difficultyScale!: DifficultyScale[]

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  estimatedTime?: number

  @OneToMany(() => GroupExercise, groupExercise => groupExercise.exercise, {
    cascade: true,
  })
  groupExercises: GroupExercise[]

  @OneToMany(() => Evaluation, evaluation => evaluation.exercise)
  evaluations: Evaluation[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
