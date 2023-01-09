import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  ArgsType,
} from '@nestjs/graphql'
import { Post } from './post.entity'
import { Aggregate, PageInfo } from '../../utils/types'
import { MediaInput } from '../media/media.types'

@ObjectType()
export class PostEdge {
  @Field(() => Post)
  node: Post
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class PostConnection {
  @Field(() => [PostEdge])
  edges: PostEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum PostPrivacies {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}
registerEnumType(PostPrivacies, { name: 'PostPrivacies' })

@ArgsType()
export class CreatePostArgs {
  @Field(() => MediaInput)
  media: MediaInput
  @Field(() => String)
  pictureUrl: string
  @Field(() => PostPrivacies)
  privacy: PostPrivacies
  @Field({ nullable: true })
  description?: string
  @Field(() => ID, { nullable: true })
  uuid?: string
}

export enum OrderByFeeds {
  INTERACTION = 'INTERACTION',
  INTERACTION_ASC = 'INTERACTION_ASC',
  INTERACTION_DSC = 'INTERACTION_DSC',
}
registerEnumType(OrderByFeeds, { name: 'OrderByFeeds' })

export enum PeriodFeeds {
  LAST_24 = 'LAST_24',
  LAST_48 = 'LAST_48',
  LAST_72 = 'LAST_72',
}
registerEnumType(PeriodFeeds, { name: 'PeriodFeeds' })

export enum MinStories {
  MIN_5 = 'MIN_5',
  MIN_10 = 'MIN_10',
  MIN_15 = 'MIN_15',
  MIN_20 = 'MIN_20',
  MIN_25 = 'MIN_25',
  MIN_50 = 'MIN_50',
}
registerEnumType(MinStories, { name: 'MinStories' })
