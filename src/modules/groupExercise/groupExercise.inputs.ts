import { ArgsType, Field, Int, ID, InputType } from '@nestjs/graphql'
import { TrainingOrderInput } from '../group/group.inputs'
import { ExerciseFormat } from '../exercise/exercise.types'
import { IsPositive } from 'class-validator'

@InputType()
export class TrainingGroupUpdateInput {
  @Field(() => Int, { nullable: true })
  @IsPositive()
  value: number
  @Field(() => ExerciseFormat, { nullable: true })
  format: ExerciseFormat
}

@InputType()
export class TrainingGroupUpdateWhereInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class TrainingGroupCreateWhereInput {
  @Field(() => ID)
  groupUuid: string
}

@InputType()
export class TrainingGroupCreateInput {
  @Field(() => ID)
  exerciseUuid: string
  @Field(() => ExerciseFormat)
  format: ExerciseFormat
  @Field(() => Int)
  value: number
  @Field(() => Int)
  position: number
}

@InputType()
export class TrainingGroupExerciseOrderWhereInput {
  @Field(() => ID)
  fromGroupUuid: string
  @Field(() => ID)
  toGroupUuid: string
  @Field(() => ID)
  exerciseUuid: string
}

@ArgsType()
export class CreateTrainingGroupExerciseArgs {
  @Field(() => TrainingGroupCreateWhereInput)
  where: TrainingGroupCreateWhereInput
  @Field(() => TrainingGroupCreateInput)
  data: TrainingGroupCreateInput
}

@ArgsType()
export class UpdateTrainingGroupExerciseArgs {
  @Field(() => TrainingGroupUpdateWhereInput)
  where: TrainingGroupUpdateWhereInput
  @Field(() => TrainingGroupUpdateInput)
  data: TrainingGroupUpdateInput
}

@ArgsType()
export class DeleteTrainingGroupExerciseArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class OrderTrainingGroupExercisesArgs {
  @Field(() => TrainingGroupUpdateWhereInput)
  where: TrainingGroupUpdateWhereInput
  @Field(() => TrainingOrderInput)
  data: TrainingOrderInput
}
