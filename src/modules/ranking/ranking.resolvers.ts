import { Resolver, Query, Args } from '@nestjs/graphql'
import { Ranking, RankingConnection } from './ranking.types'
import { RankingsArgs } from './ranking.inputs'
import { DeepPartial } from 'typeorm'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'

@UseGuards(AuthGuard)
@Resolver(() => Ranking)
export class RankingResolver {
  constructor(private readonly repos: ReposService) {}
  @Query(() => RankingConnection)
  async rankings(
    @Args() args: RankingsArgs
  ): Promise<DeepPartial<RankingConnection>> {
    const { where, after, first } = args
    const rankings = await this.repos.ranking.getRanking(where, first, after)
    return rankings
  }
}
