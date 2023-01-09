import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'

@InputType()
export class FollowWhereInput {
  @Field({ nullable: true })
  search?: string
  @Field(() => ID, { nullable: true })
  userUuid?: string
}

@InputType()
export class FollowWhereUniqueInput {
  @Field(() => ID)
  userUuid: string
}

@ArgsType()
export class FollowArgs {
  @Field(() => ID)
  userUuid: string
}

@ArgsType()
export class FollowersArgs {
  @Field(() => FollowWhereInput, { nullable: true })
  where?: FollowWhereInput
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  first?: number
}

@ArgsType()
export class FollowingArgs {
  @Field(() => FollowWhereInput, { nullable: true })
  where?: FollowWhereInput
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  first?: number
}
