import { ReportService } from './report.service'
import { Module } from '@nestjs/common'
import { ReportResolver } from './report.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './report.entity'
import { ReportLoader } from './report.loader'

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  providers: [ReportService, ReportResolver, ReportLoader],
  exports: [ReportService],
})
export class ReportModule {}
