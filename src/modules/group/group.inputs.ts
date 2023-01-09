import { Field, InputType, ID, Int, ArgsType } from '@nestjs/graphql'
import { Training } from '../training/training.entity'
import { GroupType } from './group.types'

@InputType()
export class TrainingOrderInput {
  @Field(() => Int)
  position: number
}

@InputType()
export class GroupCreateWhereInput {
  @Field(() => ID)
  trainingUuid: string
}

@InputType()
export class GroupCreateInput {
  @Field()
  name: string
  @Field(() => Int)
  position: number
  @Field(() => Int)
  restTime: number
  @Field(() => GroupType)
  type: GroupType
  training: Training
}

@InputType()
export class GroupWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class GroupUpdateInput {
  @Field({ nullable: true })
  name: string
  @Field(() => Int, { nullable: true })
  position: number
  @Field(() => Int, { nullable: true })
  restTime: number
}

@ArgsType()
export class CreateTrainingGroupArgs {
  @Field(() => GroupCreateWhereInput)
  where: GroupCreateWhereInput
  @Field(() => GroupCreateInput)
  data: GroupCreateInput
}

@ArgsType()
export class UpdateTrainingGroupArgs {
  @Field(() => GroupWhereUniqueInput)
  where: GroupWhereUniqueInput
  @Field(() => GroupUpdateInput)
  data: GroupUpdateInput
}

@ArgsType()
export class DeleteTrainingGroupArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class OrderTrainingGroupArgs {
  @Field(() => GroupWhereUniqueInput)
  where: GroupWhereUniqueInput
  @Field(() => TrainingOrderInput)
  data: TrainingOrderInput
}

@ArgsType()
export class DuplicateGroupArgs {
  @Field(() => ID)
  uuid: string
}