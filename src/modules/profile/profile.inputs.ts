import { Field, InputType, Int, ArgsType, ID } from '@nestjs/graphql'
import {
  Min,
  Max,
  MaxLength,
  ValidateNested,
  IsEmail,
  IsOptional,
} from 'class-validator'
import { Type } from 'class-transformer'
import {
  UserRunningCapacities,
  UserProgramSchedules,
  BodyAreas,
  TrainingEquipments,
  WeightBarLevels,
  UserTrainingFrequencies,
  UserObjectives,
  DevicePlaforms,
} from './profile.types'
import { UserGenders, UserLanguage } from '../user/user.types'

@InputType()
export class LooseWeightInput {
  @Field(() => UserRunningCapacities)
  runningCapacity: UserRunningCapacities
  @Field(() => UserProgramSchedules)
  programSchedule: UserProgramSchedules
  @Field(() => [BodyAreas])
  targetedBodyAreas: BodyAreas[]
  @Field(() => [TrainingEquipments])
  equipments: TrainingEquipments[]
}

@InputType()
export class StayInshapeInput {
  @Field(() => UserRunningCapacities)
  runningCapacity: UserRunningCapacities
  @Field(() => UserProgramSchedules)
  programSchedule: UserProgramSchedules
  @Field(() => [BodyAreas])
  targetedBodyAreas: BodyAreas[]
  @Field(() => [TrainingEquipments])
  equipments: TrainingEquipments[]
}

@InputType()
export class ExerciseRepInput {
  @Field(() => Int)
  @Min(1)
  @Max(25)
  repetition: number
  @Field(() => Int)
  @Min(1)
  @Max(250)
  maxWeight: number
}

@InputType()
export class BuildUpInput {
  @Field(() => UserProgramSchedules)
  programSchedule: UserProgramSchedules
  @Field(() => [BodyAreas])
  targetedBodyAreas: BodyAreas[]
  @Field(() => [TrainingEquipments])
  equipments: TrainingEquipments[]
  @Field(() => ExerciseRepInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => ExerciseRepInput)
  squats: ExerciseRepInput
  @Field(() => ExerciseRepInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => ExerciseRepInput)
  rowings: ExerciseRepInput
  @Field(() => ExerciseRepInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => ExerciseRepInput)
  deadlifts: ExerciseRepInput
  @Field(() => ExerciseRepInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => ExerciseRepInput)
  benchPresses: ExerciseRepInput
  @Field(() => UserRunningCapacities)
  runningCapacity: UserRunningCapacities
  @Field(() => WeightBarLevels, { nullable: true })
  weightBarLevel: WeightBarLevels
}

@ArgsType()
export class UpdateUserTrainingInformationsArgs {
  @Field(() => UserTrainingFrequencies)
  trainingFrequency: UserTrainingFrequencies
  @Field(() => UserGenders)
  gender: UserGenders
  @Field(() => Int)
  age: number
  @Field(() => Int)
  currentWeight: number
  @Field(() => Int)
  wantedWeight: number
  @Field(() => UserLanguage, { nullable: true })
  language?: UserLanguage
  @Field(() => Int)
  height: number
  @Field(() => UserObjectives)
  objective: UserObjectives
  @Field(() => LooseWeightInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => LooseWeightInput)
  looseWeightInformations: LooseWeightInput
  @Field(() => StayInshapeInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => StayInshapeInput)
  stayInshapeInformations: StayInshapeInput
  @Field(() => BuildUpInput, { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => BuildUpInput)
  buildUpInformations: BuildUpInput
}

@ArgsType()
export class SubscribePremiumArgs {
  @Field()
  receipt: string
  @Field(() => DevicePlaforms)
  platform: DevicePlaforms
}

@ArgsType()
export class UpdateProfileArgs {
  @Field({ nullable: true })
  firstName: string
  @Field({ nullable: true })
  lastName: string
  @Field({ nullable: true })
  userName: string
  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email: string
  @Field({ nullable: true })
  phone: string
  @Field({ nullable: true })
  @MaxLength(150)
  @IsOptional()
  description: string
  @Field(() => UserGenders, { nullable: true })
  gender: UserGenders
  @Field(() => UserLanguage, { nullable: true })
  language: UserLanguage
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Max(999)
  age: number
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Max(999)
  currentWeight: number
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Max(999)
  wantedWeight: number
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Max(999)
  height: number
}

@ArgsType()
export class UpdateProfilePictureArgs {
  @Field()
  pictureUrl: string
}

@InputType()
export class ProfileUserWhereInput {
  @Field(() => ID)
  userUuid: string
}

@ArgsType()
export class ProfileArgs {
  @Field(() => ProfileUserWhereInput, { nullable: true })
  where?: ProfileUserWhereInput
}
