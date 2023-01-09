import { ObjectType, Field, ID, registerEnumType, Float } from '@nestjs/graphql'
import { Running } from './running.entity'
import { Aggregate, PageInfo, Coordinate } from '../../utils/types'

@ObjectType()
export class RunningEdge {
  @Field(() => Running)
  node: Running
  @Field(() => ID)
  cursor: string
}

@ObjectType('locationData')
export class LocationData {
  @Field(() => Coordinate)
  coordinates: Coordinate
  @Field(() => Float)
  altitude: number
  @Field(() => Date)
  startedTs: string
}

@ObjectType()
export class RunningConnection {
  @Field(() => [RunningEdge])
  edges: RunningEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum RunningType {
  FREE = 'FREE',
  DISTANCE = 'DISTANCE',
  DURATION = 'DURATION',
}
registerEnumType(RunningType, { name: 'RunningType' })
