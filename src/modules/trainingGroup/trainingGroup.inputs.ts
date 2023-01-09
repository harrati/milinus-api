import { InputType, Field, ID, ArgsType } from '@nestjs/graphql'

@InputType()
export class TrainingsGroupCreateInput {
  @Field(() => Boolean)
  default: boolean
}

@InputType()
export class GroupTrainingCreateWhereUniqueInput {
  @Field(() => ID)
  programUuid: string
}

@InputType()
export class GroupTrainingUpdateWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class CreateTrainingGroupArgs {
  @Field(() => GroupTrainingCreateWhereUniqueInput)
  where: GroupTrainingCreateWhereUniqueInput
  @Field(() => TrainingsGroupCreateInput)
  data: TrainingsGroupCreateInput
}

@ArgsType()
export class TrainingGroupUpdateArgs {
  @Field(() => GroupTrainingUpdateWhereUniqueInput)
  where: GroupTrainingUpdateWhereUniqueInput
  @Field(() => TrainingsGroupCreateInput)
  data: TrainingsGroupCreateInput
}
