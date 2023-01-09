import { RunningService } from './running.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Running } from './running.entity'
import { RunningResolver } from './running.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Running])],
  providers: [RunningService, RunningResolver],
  exports: [RunningService],
})
export class RunningModule {}
