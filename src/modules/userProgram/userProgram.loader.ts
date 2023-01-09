import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import chunk from 'lodash/chunk'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { Program } from '../program/program.entity'
import { UserProgram } from './userProgram.entity'
import { UserTraining } from '../userTraining/userTraining.entity'
import { trainingFrequencyMapper } from '../../utils/enumMapper'
import { UserEvaluation } from '../userEvaluation/userEvaluation.entity'
import { Nullable } from '../../utils/types'

@Injectable()
export class UserProgramLoader {
  constructor(private readonly repos: ReposService) {}

  program() {
    return new DataLoader<UserProgram, DeepPartial<Program>>(data =>
      Promise.all(
        data.map(async userProgram => {
          const program = await this.repos.userProgram.loadProgram(userProgram)
          return program
        })
      )
    )
  }

  userTrainings() {
    return new DataLoader<UserProgram, DeepPartial<UserTraining>[][]>(data =>
      Promise.all(
        data.map(async userProgram => {
          const { trainingFrequency } = userProgram
          const userTrainings = await this.repos.userTraining.loadUserTrainings(
            userProgram
          )
          // each array represent the week's trainings
          const chunks = chunk<UserTraining>(
            userTrainings,
            trainingFrequencyMapper[trainingFrequency]
          )
          return chunks
        })
      )
    )
  }

  userEvaluations() {
    return new DataLoader<UserProgram, DeepPartial<UserEvaluation>[]>(data =>
      Promise.all(
        data.map(async userProgram => {
          const userEvaluations = await this.repos.userProgram.loadUserEvaluations(
            userProgram
          )
          return userEvaluations
        })
      )
    )
  }

  isEvaluationDue() {
    return new DataLoader<UserProgram, boolean>(data =>
      Promise.all(
        data.map(userProgram =>
          this.repos.userProgram.isEvaluationDue(userProgram)
        )
      )
    )
  }

  currentTrainingIndex() {
    return new DataLoader<UserProgram, Nullable<number>>(data =>
      Promise.all(
        data.map(userProgram =>
          this.repos.userTraining.getCurrentTrainingIndex(userProgram)
        )
      )
    )
  }

  evaluationSchedule() {
    return new DataLoader<UserProgram, number[]>(data =>
      Promise.all(
        data.map(userProgram =>
          this.repos.userProgram.getEvaluationsSchedule(userProgram)
        )
      )
    )
  }
}
