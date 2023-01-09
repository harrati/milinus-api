import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql'
import { Group } from './group.entity'
import { Aggregate, PageInfo } from '../../utils/types'

export enum GroupType {
  FINISHER = 'FINISHER',
  DEFAULT = 'DEFAULT',
  STRETCHING = 'STRETCHING',
}
registerEnumType(GroupType, { name: 'GroupType' })

@ObjectType()
export class GroupEdge {
  @Field(() => Group)
  node: Group
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class GroupConnection {
  @Field(() => [GroupEdge])
  edges: GroupEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}
