import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Aggregate, PageInfo } from '../../utils/types'
import { Planet } from './planet.entity'

@ObjectType()
export class PlanetEdge {
  @Field(() => Planet)
  node: Planet
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class PlanetConnection {
  @Field(() => [PlanetEdge])
  edges: PlanetEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}
