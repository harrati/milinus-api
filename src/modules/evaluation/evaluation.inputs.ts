import { Field, ArgsType, InputType, ID, Int } from '@nestjs/graphql'
import { WhereUniqueInput } from '../../utils/types'

@ArgsType()
export class CreateEvaluationArgs {
  @Field(() => Int)
  duration: number

  @Field(() => ID)
  programUuid: string

  @Field(() => ID)
  exerciseUuid: string
}

@InputType()
export class UpdateEvaluationInput {
  @Field(() => Int)
  duration?: number

  @Field(() => ID)
  exerciseUuid?: string
}

@ArgsType()
export class EvaluationWhereInput {
  @Field(() => ID)
  programUuid: string
}

@ArgsType()
export class UpdateEvaluationArgs {
  @Field(() => WhereUniqueInput)
  where: WhereUniqueInput
  @Field(() => UpdateEvaluationInput)
  data: UpdateEvaluationInput
}
