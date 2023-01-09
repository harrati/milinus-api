import { MinLength, MaxLength, IsOptional } from 'class-validator'
import { InputType, Field, ID, Int, Float, ArgsType } from '@nestjs/graphql'
import {
  TrainingEquipments,
  BodyAreas,
  UserTrainingFrequencies,
} from '../profile/profile.types'
import {
  ToggleStatus,
  WhereUniqueInput,
  OrderByDirection,
  OrderName,
} from '../../utils/types'
import { ExerciseTypes, ExerciseFormat } from './exercise.types'
import { IsNotEqualTo } from '../../validators/IsNotEqualTo.validator'
import { IsPropertyValue } from '../../validators/IsPropertyValue.validator'
import { ValidateDifficultyScale } from '../../validators/ValidateDifficultyScale.validator'
import { IsPropertyValueNot } from '../../validators/IsPropertyValueNot.validator'

@InputType()
export class DifficultyScaleRulesInput {
  @Field(() => Int)
  start: number
  @Field(() => Int)
  end: number
  @Field(() => Float)
  step: number
}
@InputType()
export class DifficultyScaleInput {
  @Field(() => ExerciseFormat)
  format: ExerciseFormat
  @Field(() => Float)
  initialDifficulty: number
  @Field(() => Int)
  maxNumber: number
  @Field(() => [DifficultyScaleRulesInput])
  difficultyScaleRules: DifficultyScaleRulesInput[]
}

@InputType('ExerciseWhereInput')
export class ExerciseWhereInput {
  @Field(() => UserTrainingFrequencies, { nullable: true })
  difficulty?: UserTrainingFrequencies

  @Field(() => [BodyAreas], { nullable: true })
  bodyAreas?: BodyAreas[]

  @Field(() => [ExerciseTypes], { nullable: true })
  types?: ExerciseTypes[]

  @Field(() => ToggleStatus, { nullable: true })
  status?: ToggleStatus

  @Field(() => [ExerciseFormat], { nullable: true })
  format?: ExerciseFormat[]

  @Field(() => [TrainingEquipments], { nullable: true })
  equipments?: TrainingEquipments[]

  @Field(() => String, { nullable: true })
  search?: string
}

@ArgsType()
export class ExercisesArgs {
  @Field(() => ExerciseWhereInput, { nullable: true })
  where?: ExerciseWhereInput
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => OrderByDirection, { nullable: true })
  order: OrderByDirection
  @Field(() => OrderName, { nullable: true })
  orderName: OrderName
}

@ArgsType()
export class CreateExerciseArgs {
  @Field(() => String)
  @MinLength(1)
  @MaxLength(30)
  name: string
  @Field(() => String)
  @MinLength(1)
  @MaxLength(140)
  description: string
  @Field(() => String)
  @MinLength(1)
  @MaxLength(140)
  explanation: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(30)
  nameEn: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(140)
  descriptionEn: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(140)
  explanationEn: string
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPropertyValue('format', ExerciseFormat.REPETITION)
  estimatedTime?: number
  @Field(() => String)
  videoUrl: string
  @Field(() => String)
  gifUrl: string
  @Field(() => String)
  pictureUrl: string
  @Field(() => ExerciseTypes)
  @IsPropertyValueNot(
    ExerciseTypes.RUNNING,
    'format',
    ExerciseFormat.REPETITION
  )
  @IsPropertyValueNot(
    ExerciseTypes.RUNNING,
    'secondaryFormat',
    ExerciseFormat.REPETITION
  )
  type: ExerciseTypes
  @Field(() => BodyAreas)
  primaryBodyArea?: BodyAreas
  @Field(() => ExerciseFormat)
  format: ExerciseFormat
  @Field(() => ExerciseFormat, { nullable: true })
  @IsOptional()
  @IsNotEqualTo('format')
  secondaryFormat: ExerciseFormat
  @Field(() => BodyAreas, { nullable: true })
  @IsNotEqualTo('primaryBodyArea')
  secondaryBodyArea?: BodyAreas
  @Field(() => BodyAreas, { nullable: true })
  @IsNotEqualTo('primaryBodyArea')
  @IsNotEqualTo('secondaryBodyArea')
  tertiaryBodyArea?: BodyAreas
  @Field(() => [TrainingEquipments], { nullable: true })
  equipments?: TrainingEquipments[]
  @Field(() => ToggleStatus)
  status: ToggleStatus
  @Field(() => [DifficultyScaleInput])
  @ValidateDifficultyScale()
  difficultyScale: DifficultyScaleInput[]
}

@InputType()
export class ExerciseUpdateInput {
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(30)
  name?: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(140)
  description?: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(140)
  explanation?: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(30)
  nameEn?: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(140)
  descriptionEn?: string
  @Field(() => String, { nullable: true })
  @MinLength(1)
  @MaxLength(140)
  explanationEn?: string
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPropertyValue('format', ExerciseFormat.REPETITION)
  estimatedTime?: number
  @Field(() => String, { nullable: true })
  videoUrl?: string
  @Field(() => String, { nullable: true })
  gifUrl?: string
  @Field(() => String, { nullable: true })
  pictureUrl?: string
  @Field(() => ExerciseTypes, { nullable: true })
  @IsOptional()
  @IsPropertyValueNot(
    ExerciseTypes.RUNNING,
    'format',
    ExerciseFormat.REPETITION
  )
  @IsPropertyValueNot(
    ExerciseTypes.RUNNING,
    'secondaryFormat',
    ExerciseFormat.REPETITION
  )
  type?: ExerciseTypes
  @Field(() => BodyAreas, { nullable: true })
  primaryBodyArea?: BodyAreas
  @Field(() => ExerciseFormat, { nullable: true })
  format?: ExerciseFormat
  @Field(() => ExerciseFormat, { nullable: true })
  @IsOptional()
  @IsNotEqualTo('format')
  secondaryFormat?: ExerciseFormat
  @Field(() => BodyAreas, { nullable: true })
  @IsNotEqualTo('primaryBodyArea')
  secondaryBodyArea?: BodyAreas
  @Field(() => BodyAreas, { nullable: true })
  @IsNotEqualTo('primaryBodyArea')
  @IsNotEqualTo('secondaryBodyArea')
  tertiaryBodyArea?: BodyAreas
  @Field(() => [TrainingEquipments], { nullable: true })
  equipments?: TrainingEquipments[]
  @Field(() => ToggleStatus, { nullable: true })
  status?: ToggleStatus
  @Field(() => [DifficultyScaleInput], { nullable: true })
  @ValidateDifficultyScale()
  difficultyScale?: DifficultyScaleInput[]
}

@ArgsType()
export class UpdateExerciseArgs {
  @Field(() => WhereUniqueInput)
  where: WhereUniqueInput
  @Field(() => ExerciseUpdateInput)
  data: ExerciseUpdateInput
}
