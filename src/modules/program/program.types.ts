import { ID, Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Program } from './program.entity'
import { Aggregate, PageInfo } from '../../utils/types'

@ObjectType()
export class ProgramEdge {
  @Field(() => Program)
  node: Program
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class ProgramConnection {
  @Field(() => [ProgramEdge])
  edges: ProgramEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum ProgramOfferType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ALL = 'ALL',
}
registerEnumType(ProgramOfferType, { name: 'ProgramOfferType' })
