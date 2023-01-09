import { Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { UserTraining } from './userTraining.entity'
import { DeepPartial } from 'typeorm'
import { Training } from '../training/training.entity'
import { ReposService } from '../repos.service'
import { Nullable } from '../../utils/types'
import { TrainingReport } from '../trainingReport/trainingReport.entity'
import { Running } from '../running/running.entity'

@Injectable()
export class UserTrainingLoader {
  constructor(private readonly repos: ReposService) {}

  training() {
    return new DataLoader<UserTraining, DeepPartial<Training>>(async data =>
      Promise.all(
        data.map(async userTraining => {
          const training = await this.repos.userTraining.loadTraining(
            userTraining
          )
          return training
        })
      )
    )
  }

  report() {
    return new DataLoader<UserTraining, Nullable<DeepPartial<TrainingReport>>>(
      data =>
        Promise.all(
          data.map(async userTraining => {
            const report = await this.repos.trainingReport.findByUserTraining(
              userTraining
            )
            return report || null
          })
        )
    )
  }

  runnings() {
    return new DataLoader<UserTraining, Nullable<DeepPartial<Running[]>>>(
      data =>
        Promise.all(
          data.map(async userTraining => {
            const runnings = await this.repos.running.findByUserTraining(
              userTraining
            )
            return runnings.length ? runnings : null
          })
        )
    )
  }
}
