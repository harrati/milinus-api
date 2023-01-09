import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { Evaluation } from '../evaluation/evaluation.entity'
import { Exercise } from '../exercise/exercise.entity'

@Injectable()
export class EvaluationLoader {
  constructor(private readonly repos: ReposService) {}

  loadExerciseForEvaluation() {
    return new DataLoader<Evaluation, DeepPartial<Exercise>>(async data =>
      Promise.all(
        data.map(async evaluation => {
          const exercise = await this.repos.evaluation.getExerciseForEvaluation(
            evaluation
          )
          return exercise
        })
      )
    )
  }
}
