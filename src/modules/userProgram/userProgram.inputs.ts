import { ArgsType, Field, ID } from '@nestjs/graphql'

@ArgsType()
export class UserProgramArgs {
  @Field(() => ID)
  uuid: string
}
