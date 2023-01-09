import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { Aggregate, PageInfo } from '../../utils/types'
import { Place } from './place.entity'

@ObjectType()
export class PlaceEdge {
  @Field(() => Place)
  node: Place
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class PlaceConnection {
  @Field(() => [PlaceEdge])
  edges: PlaceEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum PlaceCategories {
  OUTSIDE = 'OUTSIDE',
  GYM = 'GYM',
}
registerEnumType(PlaceCategories, { name: 'PlaceCategories' })
