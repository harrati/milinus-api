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
import { Group } from '../group/group.entity'
import { Program } from '../program/program.entity'
import { UserTraining } from '../userTraining/userTraining.entity'
import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql'
import { BodyAreas, TrainingEquipments } from '../profile/profile.types'
import { TrainingType } from './training.types'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'

@Entity()
@ObjectType()
export class Training {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int', nullable: true })
  secretId: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column()
  @Field()
  name!: string

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  description: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  nameEn: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  descriptionEn: string

  @Field(() => Int, { nullable: true })
  duration: number

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  position!: number

  @Field(() => Float, { nullable: true })
  difficulty!: number

  @Field(() => [BodyAreas], { nullable: true })
  bodyAreas: BodyAreas[]

  @Field(() => [TrainingEquipments], { nullable: true })
  equipments: TrainingEquipments[]

  @Column({
    type: 'enum',
    enum: TrainingType,
    nullable: true,
  })
  @Field(() => TrainingType)
  type: TrainingType

  @OneToMany(() => Group, group => group.training)
  @Field(() => [Group])
  groups: Group[]

  @ManyToOne(() => Program, program => program.trainings, {
    onDelete: 'CASCADE',
  })
  @Field(() => Program)
  program: Program

  @ManyToOne(() => TrainingGroup, trainingGroup => trainingGroup.trainings, {
    onDelete: 'CASCADE',
  })
  trainingGroup: TrainingGroup

  @OneToMany(() => UserTraining, userTraining => userTraining.userProgram)
  userTrainings!: UserTraining[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
