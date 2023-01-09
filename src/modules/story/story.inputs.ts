import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import { ReactionType } from './story.types'
import { UserWhereUniqueInput } from '../user/user.inputs'
import { MediaInput } from '../media/media.types'

@InputType()
export class StoryWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class ReactStoryInput {
  @Field(() => ReactionType)
  reaction: ReactionType
}

@InputType()
export class AddStoryMediaInput {
  @Field()
  url: string
}

@InputType()
export class StoriesWhereInput {
  @Field(() => ID)
  userUuid: string
}

@InputType()
export class FeedWhereInput {
  @Field(() => ID)
  userUuid: string
}

@ArgsType()
export class StoryArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class StoriesArgs {
  @Field(() => StoriesWhereInput)
  where: StoriesWhereInput
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
}

@ArgsType()
export class FeedArgs {
  @Field(() => FeedWhereInput)
  where: FeedWhereInput
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
}

@ArgsType()
export class CreateStoryArgs {
  @Field(() => [MediaInput])
  medias: MediaInput[]
  @Field({ nullable: true })
  description?: string
  @Field(() => ID, { nullable: true })
  uuid?: string
}

@ArgsType()
export class ReactStoryArgs {
  @Field(() => StoryWhereUniqueInput)
  where: StoryWhereUniqueInput
  @Field(() => ReactStoryInput)
  data: ReactStoryInput
}

@ArgsType()
export class UserStoriesArgs {
  @Field(() => UserWhereUniqueInput)
  where: UserWhereUniqueInput
}

@ArgsType()
export class RepostArgs {
  @Field(() => ID, { nullable: true })
  storyUuid?: string
  @Field(() => ID, { nullable: true })
  postUuid?: string
}
