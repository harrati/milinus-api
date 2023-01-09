import { ArgsType, Field, ID, InputType, Int } from '@nestjs/graphql'
import { RequestCategory } from './userRequest.types'

@InputType()
export class RequestWhereInput {
  @Field(() => RequestCategory, { nullable: true })
  category?: RequestCategory
}

@ArgsType()
export class CreateUserRequestArgs {
  @Field(() => RequestCategory)
  category: RequestCategory
}

@ArgsType()
export class UserRequestArgs {
  @Field(() => RequestWhereInput, { nullable: true })
  where?: RequestWhereInput

  @Field(() => ID, { nullable: true })
  after?: string

  @Field(() => Int, { nullable: true })
  first?: number
}
