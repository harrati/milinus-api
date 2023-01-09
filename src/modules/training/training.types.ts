import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { Training } from './training.entity'
import { Aggregate, PageInfo } from '../../utils/types'

@ObjectType()
export class TrainingEdge {
  @Field(() => Training)
  node: Training
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class TrainingConnection {
  @Field(() => [TrainingEdge])
  edges: TrainingEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum TrainingType {
  RUNNING = 'RUNNING',
  WEIGHT = 'WEIGHT',
  FITNESS = 'FITNESS',
}
registerEnumType(TrainingType, { name: 'TrainingType' })
