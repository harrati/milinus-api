import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Evaluation } from './evaluation.entity'
import { EvaluationService } from './evaluation.service'
import { EvaluationLoader } from './evaluation.loader'
import { EvaluationResolver } from './evaluation.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Evaluation])],
  providers: [EvaluationService, EvaluationLoader, EvaluationResolver],
  exports: [EvaluationService, EvaluationResolver],
})
export class EvaluationModule {}
