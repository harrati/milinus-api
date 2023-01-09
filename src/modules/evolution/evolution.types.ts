import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Evolution } from './evolution.entity'
import { Aggregate, PageInfo } from '../../utils/types'

@ObjectType()
export class EvolutionEdge {
  @Field(() => Evolution)
  node: Evolution
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class EvolutionConnection {
  @Field(() => [EvolutionEdge])
  edges: EvolutionEdge[]

  @Field(() => Aggregate)
  aggregate: Aggregate

  @Field(() => PageInfo)
  pageInfo: PageInfo
}
