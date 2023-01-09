import { Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { TrainingReport } from './trainingReport.entity'
import { TrainingReportLoader } from './trainingReport.loader'
import {
  WeightTrainingReport,
  RunningTrainingReport,
  FitnessTrainingReport,
} from './trainingReport.types'
import { DeepPartial } from 'typeorm'

@Resolver(() => TrainingReport)
export class TrainingReportResolver {
  constructor(private readonly loader: TrainingReportLoader) {}

  @ResolveField('weightTrainingReport', () => WeightTrainingReport)
  weightTrainingReport(
    @Parent() trainingReport: TrainingReport
  ): Promise<DeepPartial<WeightTrainingReport>> {
    return this.loader.weightTrainingReport().load(trainingReport)
  }

  @ResolveField('runningTrainingReport', () => RunningTrainingReport)
  runningTrainingReport(
    @Parent() trainingReport: TrainingReport
  ): Promise<DeepPartial<RunningTrainingReport>> {
    return this.loader.runningTrainingReport().load(trainingReport)
  }

  @ResolveField('fitnessTrainingReport', () => FitnessTrainingReport)
  fitnessTrainingReport(
    @Parent() trainingReport: TrainingReport
  ): Promise<DeepPartial<FitnessTrainingReport>> {
    return this.loader.fitnessTrainingReport().load(trainingReport)
  }
}
