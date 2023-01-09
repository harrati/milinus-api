import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

@InputType()
export class CommentWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class CommentArgs {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class CommentCreateWhereInput {
  @Field(() => ID, { nullable: true })
  storyUuid?: string
  @Field(() => ID, { nullable: true })
  postUuid?: string
}

@InputType()
export class CommentUpdateInput {
  @Field()
  content: string
}

@InputType()
export class CommentCreateInput {
  @Field()
  content: string
}

@ArgsType()
export class StoryCommentArgs {
  @Field(() => CommentCreateWhereInput)
  where: CommentCreateWhereInput

  @Field(() => Int, { nullable: true })
  first?: number

  @Field(() => ID, { nullable: true })
  after?: string
}

@ArgsType()
export class CreateCommentArgs {
  @Field(() => CommentCreateWhereInput)
  @ValidateNested({ each: true })
  @Type(() => CommentCreateWhereInput)
  where: CommentCreateWhereInput

  @Field(() => CommentCreateInput)
  @ValidateNested({ each: true })
  @Type(() => CommentCreateInput)
  data: CommentCreateInput
}

@ArgsType()
export class UpdateCommentArgs {
  @Field(() => CommentWhereUniqueInput)
  @ValidateNested({ each: true })
  @Type(() => CommentWhereUniqueInput)
  where: CommentWhereUniqueInput

  @Field(() => CommentUpdateInput)
  @ValidateNested({ each: true })
  @Type(() => CommentUpdateInput)
  data: CommentUpdateInput
}
