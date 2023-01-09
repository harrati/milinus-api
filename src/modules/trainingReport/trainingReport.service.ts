import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrainingReport } from './trainingReport.entity'
import { LibsService } from '../../libs/libs.service'
import { UserTraining } from '../userTraining/userTraining.entity'
import { User } from '../user/user.entity'
import { UserProgram } from '../userProgram/userProgram.entity'
import { TRAINING_REPORT_COEFFICIENT } from '../../utils/constants'

@Injectable()
export class TrainingReportService {
  constructor(
    @InjectRepository(TrainingReport)
    public readonly trainingReportRepository: Repository<TrainingReport>,
    private readonly libs: LibsService
  ) {}

  findByUserTraining(userTraining: UserTraining) {
    return this.trainingReportRepository
      .createQueryBuilder('report')
      .where('report."userTrainingId" = :userTrainingId', {
        userTrainingId: userTraining.id,
      })
      .getOne()
  }

  async loadUserTraining(trainingReport: TrainingReport) {
    const { userTraining } = await this.trainingReportRepository.findOneOrFail(
      trainingReport.id,
      { relations: ['userTraining'] }
    )
    return userTraining
  }

  create(
    userTraining: UserTraining,
    userProgram: UserProgram,
    trainingIndex: number,
    duration: number
  ) {
    const kcal = Math.ceil((duration / 60) * 10)
    const points = Math.ceil(
      (kcal + 100 * (trainingIndex + 1)) *
        TRAINING_REPORT_COEFFICIENT[userProgram.trainingFrequency]
    )
    const trainingReport = this.trainingReportRepository.create({
      duration,
      kcal,
      points,
      userTraining,
      user: userProgram.user,
    })
    return this.trainingReportRepository.save(trainingReport)
  }

  findByUser(user: User) {
    return this.trainingReportRepository
      .createQueryBuilder('report')
      .where(reportBuilder => {
        const utQuery = reportBuilder
          .subQuery()
          .select('ut.id')
          .from(UserTraining, 'ut')
          .where(utBuilder => {
            const upQuery = utBuilder
              .subQuery()
              .select('up.id')
              .from(UserProgram, 'up')
              .where('up."userId" = :userId', { userId: user.id })
              .getQuery()
            return 'ut."userProgramId" IN ' + upQuery
          })
          .getQuery()
        return 'report."userTrainingId" IN ' + utQuery
      })
      .getMany()
  }
}
