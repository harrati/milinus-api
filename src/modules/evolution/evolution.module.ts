import { EvolutionService } from './evolution.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Evolution } from './evolution.entity'
import { EvolutionResolver } from './evolution.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Evolution])],
  providers: [EvolutionService, EvolutionResolver],
  exports: [EvolutionService, EvolutionResolver],
})
export class EvolutionModule {}
