import { Module } from '@nestjs/common'
import { RankingResolver } from './ranking.resolvers'
import { RankingService } from './ranking.service'

@Module({
  imports: [],
  providers: [RankingResolver, RankingService],
  exports: [RankingService],
})
export class RankingModule {}
