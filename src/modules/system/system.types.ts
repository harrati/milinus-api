import { ObjectType, Field, ID, InputType, ArgsType } from '@nestjs/graphql'
import { System } from './system.entity'
import { Aggregate, PageInfo } from '../../utils/types'

@ObjectType()
export class SystemEdge {
  @Field(() => System)
  node: System
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class SystemConnection {
  @Field(() => [SystemEdge])
  edges: SystemEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

@InputType()
export class SystemWhereInput {
  @Field(() => ID)
  userUuid: string
}

@ArgsType()
export class UserSystemsArgs {
  @Field(() => SystemWhereInput, { nullable: true })
  where?: SystemWhereInput
}
