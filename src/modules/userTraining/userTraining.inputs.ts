import { Field, ID, Float, InputType, ArgsType } from '@nestjs/graphql'
import { FeedbackData } from './userTraining.types'

@InputType()
export class UserTrainingWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class UserTrainingArgs {
  @Field(() => ID)
  userTrainingUuid: string
}

@ArgsType()
export class CompleteCurrentTrainingArgs {
  @Field(() => Float)
  duration: number
  @Field(() => Boolean)
  finisher: boolean
  @Field(() => FeedbackData, { nullable: true })
  feedback?: FeedbackData
}
