import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import { TrainingType } from './training.types'
import { Program } from '../program/program.entity'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'

@InputType()
export class TrainingWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class TrainingCreateInput {
  @Field()
  name: string
  @Field({ nullable: true })
  description?: string
  @Field({ nullable: true })
  nameEn: string
  @Field({ nullable: true })
  descriptionEn?: string
  @Field(() => TrainingType)
  type: TrainingType
  @Field(() => Int)
  position: number
  program: Program
  trainingGroup: TrainingGroup
}

@InputType()
export class TrainingUpdateInput {
  @Field({ nullable: true })
  name?: string
  @Field({ nullable: true })
  description?: string
  @Field(() => TrainingType, { nullable: true })
  type?: TrainingType
  @Field(() => Int, { nullable: true })
  position: number
}

@InputType()
export class TrainingCreateWhereUniqueInput {
  @Field(() => ID)
  programUuid: string
  @Field(() => ID)
  trainingGroupUuid: string
}

@InputType()
export class TrainingFilters {
  @Field(() => Number, { nullable: true })
  trainingGroup: number
}

@ArgsType()
export class TrainingArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class TrainingsArgs {
  @Field(() => ID)
  programUuid: string
  @Field(() => TrainingFilters, { nullable: true })
  filters: TrainingFilters
  @Field(() => String, { nullable: true })
  order: string
}

@ArgsType()
export class CreateTrainingArgs {
  @Field(() => TrainingCreateWhereUniqueInput)
  where: TrainingCreateWhereUniqueInput
  @Field(() => TrainingCreateInput)
  data: TrainingCreateInput
}

@ArgsType()
export class UpdateTrainingArgs {
  @Field(() => TrainingWhereUniqueInput)
  where: TrainingWhereUniqueInput
  @Field(() => TrainingUpdateInput)
  data: TrainingUpdateInput
}
