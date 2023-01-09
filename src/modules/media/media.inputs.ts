import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import { StoryWhereUniqueInput } from '../story/story.inputs'

@InputType()
export class AddStoryMediaInput {
  @Field()
  url: string
}
@ArgsType()
export class MediaArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class MediasArgs {
  @Field(() => StoryWhereUniqueInput)
  where: StoryWhereUniqueInput
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
}

@ArgsType()
export class CreateMediasArgs {
  @Field(() => StoryWhereUniqueInput)
  where: StoryWhereUniqueInput
  @Field(() => AddStoryMediaInput)
  data: AddStoryMediaInput
}
