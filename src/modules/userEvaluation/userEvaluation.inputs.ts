import { ArgsType, Field, Int } from '@nestjs/graphql'

@ArgsType()
export class CompleteEvaluationArgs {
  @Field(() => Int)
  result: number
}
