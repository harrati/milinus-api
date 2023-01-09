import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { Program } from './program.entity'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { Training } from '../training/training.entity'
import { Evaluation } from '../evaluation/evaluation.entity'
import { System } from '../system/system.entity'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'
import { BodyAreas } from '../profile/profile.types'

@Injectable()
export class ProgramLoader {
  constructor(private readonly repos: ReposService) {}

  training() {
    return new DataLoader<Program, DeepPartial<Training>[]>(async data =>
      Promise.all(
        data.map(async program => {
          let trainingConnection = await this.repos.training.getTrainings(
            program
          )
          trainingConnection = trainingConnection.sort(
            (a, b) => a.position - b.position
          )

          return trainingConnection
        })
      )
    )
  }

  evaluation() {
    return new DataLoader<Program, DeepPartial<Evaluation>>(async data =>
      Promise.all(
        data.map(async program => {
          const evaluation = await this.repos.program.getEvaluationForProgram(
            program
          )
          return evaluation
        })
      )
    )
  }

  trainingGroups() {
    return new DataLoader<Program, DeepPartial<TrainingGroup[]>>(async data =>
      Promise.all(
        data.map(async program => {
          const trainingGroups = await this.repos.trainingGroup.findByProgramUuid(
            program.uuid
          )
          return trainingGroups
        })
      )
    )
  }

  system() {
    return new DataLoader<Program, DeepPartial<System>>(async data =>
      Promise.all(
        data.map(async program => {
          const system = await this.repos.program.getSystemForProgram(program)
          return system
        })
      )
    )
  }

  bodyAreas() {
    return new DataLoader<Program, BodyAreas[]>(async data =>
      Promise.all(
        data.map(async program => {
          const bodyAreas = await this.repos.program.getProgramBodyAreas(
            program.id
          )
          return bodyAreas
        })
      )
    )
  }
}
