import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'

import { TrainingGroup } from './trainingGroup.entity'
import { Training } from '../training/training.entity'

@Injectable()
export class TrainingGroupLoader {
  constructor(private readonly repos: ReposService) {}

  difficulty() {
    return new DataLoader<TrainingGroup, number>(async data =>
      Promise.all(
        data.map(async trainingGroup => {
          return await this.repos.trainingGroup.computeDifficulty(
            trainingGroup.uuid
          )
        })
      )
    )
  }

  trainings() {
    return new DataLoader<TrainingGroup, Training[]>(async data =>
      Promise.all(
        data.map(async trainingGroup => {
          const trainingGroupWithTraining = await this.repos.trainingGroup.getTrainingGroupWithTrainings(
            trainingGroup
          )
          const { trainings } = trainingGroupWithTraining
          return trainings
        })
      )
    )
  }
}
