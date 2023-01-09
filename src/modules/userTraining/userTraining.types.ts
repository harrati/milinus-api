import { registerEnumType, ObjectType, Field } from '@nestjs/graphql'

export enum UserTrainingStatus {
  DONE = 'DONE',
  CURRENT = 'CURRENT',
  PENDING = 'PENDING',
}
registerEnumType(UserTrainingStatus, { name: 'UserTrainingStatus' })

export enum FeedbackData {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}
registerEnumType(FeedbackData, { name: 'FeedbackData' })

@ObjectType()
export class TrainingActions {
  @Field(() => Boolean)
  increase: boolean
  @Field(() => Boolean)
  decrease: boolean
}
