import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import { ContactSubject, UserSubscriptionPeriod } from './user.types'
@InputType()
export class ProfileWhereInput {
  @Field(() => String)
  search: string
}

@InputType()
export class UserWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class UserArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class StatusSubscriptionArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class StatusSubscriptionPreniumArgs {
  @Field(() => ID)
  uuid: string
  @Field(() => UserSubscriptionPeriod)
  period: UserSubscriptionPeriod
}

@ArgsType()
export class ProfilesArgs {
  @Field(() => ProfileWhereInput, { nullable: true })
  where?: ProfileWhereInput

  @Field(() => ID, { nullable: true })
  after?: string

  @Field(() => Int, { nullable: true })
  first?: number
}

@ArgsType()
export class ProfilesUserNameArgs {
  @Field(() => String)
  search?: string

  @Field(() => Int, { nullable: true })
  skip?: number

  @Field(() => Int, { nullable: true })
  take?: number
}

@InputType()
export class ContactInput {
  @Field(() => ContactSubject)
  subject: ContactSubject

  @Field(() => String)
  content: string
}

@ArgsType()
export class ContactArgs {
  @Field(() => ContactInput)
  data: ContactInput
}
