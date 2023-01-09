import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingReport } from './trainingReport.entity'
import { TrainingReportService } from './trainingReport.service'
import { TrainingReportResolver } from './trainingReport.resolver'
import { TrainingReportLoader } from './trainingReport.loader'

@Module({
  imports: [TypeOrmModule.forFeature([TrainingReport])],
  providers: [
    TrainingReportService,
    TrainingReportResolver,
    TrainingReportLoader,
  ],
  exports: [TrainingReportService],
})
export class TrainingReportModule {}
