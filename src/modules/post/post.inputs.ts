import { ArgsType, Field } from '@nestjs/graphql'
import { WhereUniqueInput } from '../../utils/types'
import { ReactStoryInput } from '../story/story.inputs'
import { OrderByFeeds, PeriodFeeds, MinStories } from './post.types'
import { ID, Int } from '@nestjs/graphql'
@ArgsType()
export class PostArgs {
  @Field(() => WhereUniqueInput)
  where: WhereUniqueInput
}

@ArgsType()
export class ReactPostArgs {
  @Field(() => WhereUniqueInput)
  where: WhereUniqueInput
  @Field(() => ReactStoryInput)
  data: ReactStoryInput
}
@ArgsType()
export class FeedsArgs {
  @Field(() => OrderByFeeds, { nullable: true })
  orderby?: OrderByFeeds

  @Field(() => PeriodFeeds, { nullable: true })
  duringthe?: PeriodFeeds

  @Field(() => ID, { nullable: true })
  after?: string

  @Field(() => Int, { nullable: true })
  first?: number

  @Field(() => MinStories, { nullable: true })
  minstories?: MinStories
}
