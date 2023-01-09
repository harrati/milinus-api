import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql'
import { User } from '../user/user.entity'
import { PageInfo, Aggregate } from '../../utils/types'
import { System } from '../system/system.entity'

export enum RankingType {
  ALL = 'ALL',
  FRIENDS = 'FRIENDS',
}
registerEnumType(RankingType, { name: 'RankingType' })

@ObjectType()
export class Ranking {
  @Field(() => Int)
  position: number
  @Field(() => Int)
  points: number
  @Field(() => User)
  user: User
  @Field(() => System, { nullable: true })
  system?: System
}

@ObjectType()
export class RankingEdge {
  @Field(() => Ranking)
  node: Ranking
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class RankingConnection {
  @Field(() => [RankingEdge])
  edges: RankingEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}
