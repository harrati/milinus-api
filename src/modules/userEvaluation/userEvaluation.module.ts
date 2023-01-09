import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEvaluation } from './userEvaluation.entity'
import { UserEvaluationService } from './userEvaluation.service'
import { UserEvaluationResolver } from './userEvaluation.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([UserEvaluation])],
  providers: [UserEvaluationService, UserEvaluationResolver],
  exports: [UserEvaluationService],
})
export class UserEvaluationModule {}
