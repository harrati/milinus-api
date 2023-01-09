import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Aggregate, PageInfo } from '../../utils/types'
import { Comment } from './comment.entity'

@ObjectType()
export class CommentEdge {
  @Field(() => Comment)
  node: Comment
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class CommentConnection {
  @Field(() => [CommentEdge])
  edges: CommentEdge[]

  @Field(() => Aggregate)
  aggregate: Aggregate

  @Field(() => PageInfo)
  pageInfo: PageInfo
}
