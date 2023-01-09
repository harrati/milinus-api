import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql'
import {
  ToggleStatus,
  WhereUniqueInput,
  OrderByDirection,
} from '../../utils/types'
import {
  UserObjectives,
  UserTrainingFrequencies,
  UserRunningCapacities,
  BodyAreas,
  TrainingEquipments,
} from '../profile/profile.types'
import { ProgramOfferType } from './program.types'
import { UserGenders, UserSubscriptionStatus } from '../user/user.types'
import { ExerciseTypes } from '../exercise/exercise.types'
import { System } from '../system/system.entity'
import { MaxLength, IsOptional } from 'class-validator'

@ArgsType()
export class CreateProgramArgs {
  @Field({ nullable: true })
  uuid?: string
  @Field()
  name: string
  @Field({ nullable: true })
  nameEn: string
  @Field(() => String)
  pictureUrl: string
  @Field()
  @MaxLength(500)
  description: string
  @Field({ nullable: true, defaultValue: '' })
  @MaxLength(500)
  descriptionEn?: string
  @Field(() => ID)
  systemUuid: string
  system: System
  @Field(() => [ID], { nullable: true })
  trainings: string[]
  @Field(() => Int, { nullable: true })
  duration: number
  @Field(() => ToggleStatus)
  status: ToggleStatus
  @Field(() => UserObjectives)
  objective: UserObjectives
  @Field(() => UserGenders)
  targetGender: UserGenders
  @Field(() => UserTrainingFrequencies, { nullable: true })
  trainingFrequency: UserTrainingFrequencies
  @Field(() => UserRunningCapacities)
  runningCapacity: UserRunningCapacities
  @Field(() => UserSubscriptionStatus)
  offer: UserSubscriptionStatus
  @Field(() => UserTrainingFrequencies)
  difficulty: UserTrainingFrequencies
}

@InputType()
export class UpdateProgramInput {
  @Field({ nullable: true })
  uuid?: string
  @Field({ nullable: true })
  name?: string
  @Field({ nullable: true })
  nameEn?: string
  @Field(() => String, { nullable: true })
  pictureUrl?: string
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500)
  description?: string
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500)
  descriptionEn?: string
  @Field(() => ID, { nullable: true })
  systemUuid?: string
  system: System
  @Field(() => [ID], { nullable: true })
  trainings?: string[]
  @Field(() => Int, { nullable: true })
  duration?: number
  @Field(() => ToggleStatus, { nullable: true })
  status?: ToggleStatus
  @Field(() => UserObjectives, { nullable: true })
  objective?: UserObjectives
  @Field(() => UserGenders, { nullable: true })
  targetGender?: UserGenders
  @Field(() => UserTrainingFrequencies, { nullable: true })
  trainingFrequency?: UserTrainingFrequencies
  @Field(() => UserRunningCapacities, { nullable: true })
  runningCapacity?: UserRunningCapacities
  @Field(() => UserSubscriptionStatus, { nullable: true })
  offer?: UserSubscriptionStatus
  @Field(() => UserTrainingFrequencies, { nullable: true })
  difficulty?: UserTrainingFrequencies
}

@ArgsType()
export class UpdateProgramArgs {
  @Field(() => WhereUniqueInput)
  where: WhereUniqueInput
  @Field(() => UpdateProgramInput)
  data: UpdateProgramInput
}

@ArgsType()
export class MyProgramsArgs {
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ProgramOfferType, { nullable: true })
  offer?: ProgramOfferType
}

@InputType('ProgramWhereInput')
export class ProgramWhereInput {
  @Field(() => UserTrainingFrequencies, { nullable: true })
  difficulty?: UserTrainingFrequencies

  @Field(() => [BodyAreas], { nullable: true })
  bodyAreas?: BodyAreas[]

  @Field(() => ProgramOfferType, { nullable: true })
  offer?: ProgramOfferType

  @Field(() => [ExerciseTypes], { nullable: true })
  types?: ExerciseTypes[]

  @Field(() => String, { nullable: true })
  search?: string

  @Field(() => ToggleStatus, { nullable: true })
  status?: ToggleStatus

  @Field(() => UserGenders, { nullable: true })
  gender?: UserGenders

  @Field(() => UserRunningCapacities, { nullable: true })
  runningFrequency?: UserRunningCapacities

  @Field(() => UserObjectives, { nullable: true })
  objective?: UserObjectives

  @Field(() => Int, { nullable: true })
  duration?: number

  @Field(() => [TrainingEquipments], { nullable: true })
  equipment?: TrainingEquipments[]
}

@ArgsType()
export class ProgramsArgs {
  @Field(() => ProgramWhereInput, { nullable: true })
  where?: ProgramWhereInput
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => OrderByDirection, { nullable: true })
  order: OrderByDirection
}
