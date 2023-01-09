import { Field, ArgsType, InputType, ID, Int, Float } from '@nestjs/graphql'
import { User } from '../user/user.entity'

@InputType()
export class EvolutionWhereInput {
  @Field(() => Date)
  start: Date

  @Field(() => Date)
  end: Date
}

@ArgsType()
export class EvolutionsArgs {
  @Field(() => EvolutionWhereInput)
  where: EvolutionWhereInput

  @Field(() => ID, { nullable: true })
  after?: string

  @Field(() => Int, { nullable: true })
  first?: number
}

@ArgsType()
export class EvolutionsDataArgs {
  @Field(() => EvolutionWhereInput)
  where: EvolutionWhereInput
}

@ArgsType()
export class CreateEvolutionArgs {
  @Field(() => String, { nullable: true })
  pictureUrl: string

  @Field(() => Float)
  weight: number

  user: User
}
