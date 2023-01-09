import { Field, InputType, ArgsType, Int, ID } from '@nestjs/graphql'
import { RankingType } from './ranking.types'

@InputType('where')
export class RankingWhereInput {
  @Field(() => RankingType, { nullable: true })
  type?: RankingType

  @Field(() => String, { nullable: true })
  search?: string
}

@ArgsType()
export class RankingsArgs {
  @Field(() => RankingWhereInput, { nullable: true })
  where?: RankingWhereInput
  @Field(() => Int, { nullable: true })
  first: number
  @Field(() => ID, { nullable: true })
  after: string
}
