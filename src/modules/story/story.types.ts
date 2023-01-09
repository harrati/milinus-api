import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { Aggregate, PageInfo } from '../../utils/types'
import { Story } from './story.entity'

@ObjectType()
export class StoryEdge {
  @Field(() => Story)
  node: Story
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class StoryConnection {
  @Field(() => [StoryEdge])
  edges: StoryEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum ReactionType {
  SAD = 'SAD',
  LOVE = 'LOVE',
  SMILE = 'SMILE',
  ANGRY = 'ANGRY',
  FUNNY = 'FUNNY',
  EXHAUSTED = 'EXHAUSTED',
}
registerEnumType(ReactionType, { name: 'ReactionType' })

@ObjectType()
export class Reactions {
  @Field(() => Number)
  sad: number

  @Field(() => Number)
  love: number

  @Field(() => Number)
  smile: number

  @Field(() => Number)
  angry: number

  @Field(() => Number)
  funny: number

  @Field(() => Number)
  exhausted: number
}
