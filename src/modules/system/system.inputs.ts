import { ArgsType, Field, ID, InputType, Int } from '@nestjs/graphql'
import { OrderByDirection } from '../../utils/types'

@InputType()
export class SystemsWhereInput {
  @Field(() => ID)
  userUuid: string
}
@ArgsType()
export class SystemsArgs {
  @Field(() => SystemsWhereInput, { nullable: true })
  where?: SystemsWhereInput
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => OrderByDirection, { nullable: true })
  sort?: OrderByDirection
}
