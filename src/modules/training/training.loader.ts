import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import toPairs from 'lodash/toPairs'
import orderBy from 'lodash/orderBy'
import { Training } from './training.entity'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { Group } from '../group/group.entity'
import { BodyAreas, TrainingEquipments } from '../profile/profile.types'
import { Program } from '../program/program.entity'

@Injectable()
export class TrainingLoader {
  constructor(private readonly repos: ReposService) {}

  groups() {
    return new DataLoader<Training, DeepPartial<Group>[]>(async data =>
      Promise.all(
        data.map(async training => {
          const trainingConnection = await this.repos.group.getGroups(training)
          return trainingConnection
        })
      )
    )
  }

  program() {
    return new DataLoader<Training, DeepPartial<Program>>(async data =>
      Promise.all(
        data.map(async training => {
          return this.repos.training.findProgramForTraining(training.uuid)
        })
      )
    )
  }

  duration() {
    return new DataLoader<Training, number>(async data =>
      Promise.all(
        data.map(async training => {
          return this.repos.training.computeDuration(training.id)
        })
      )
    )
  }

  bodyAreas() {
    return new DataLoader<Training, BodyAreas[]>(async data =>
      Promise.all(
        data.map(async training => {
          const exercises = await this.repos.exercise.getTrainingExercises(
            training
          )
          const mapper = {
            [BodyAreas.ABS]: 0,
            [BodyAreas.ARMS]: 0,
            [BodyAreas.ASS]: 0,
            [BodyAreas.BACK]: 0,
            [BodyAreas.CHEST]: 0,
            [BodyAreas.SHOULDERS]: 0,
            [BodyAreas.THIGH]: 0,
            [BodyAreas.CARDIO]: 0,
            [BodyAreas.FULL_BODY]: 0,
          }

          const results = exercises.reduce((accumulator, exercise) => {
            const {
              primaryBodyArea,
              secondaryBodyArea,
              tertiaryBodyArea,
            } = exercise
            const newValues = { ...accumulator }
            newValues[primaryBodyArea] = newValues[primaryBodyArea] + 1
            if (secondaryBodyArea)
              newValues[secondaryBodyArea] = newValues[secondaryBodyArea] + 1
            if (tertiaryBodyArea)
              newValues[tertiaryBodyArea] = newValues[tertiaryBodyArea] + 1
            return newValues
          }, mapper)

          const pairs = toPairs(results)
          const ordered = orderBy(
            pairs,
            ([, iterations]) => {
              return iterations
            },
            ['desc']
          )
          const bodyAreas = ordered
            .map(([bodyArea]) => bodyArea)
            .filter(
              bodyArea =>
                bodyArea !== BodyAreas.CARDIO &&
                bodyArea !== BodyAreas.FULL_BODY &&
                bodyArea !== 'null'
            ) as BodyAreas[]
          return bodyAreas
        })
      )
    )
  }

  difficulty() {
    return new DataLoader<Training, number>(async data =>
      Promise.all(
        data.map(async training => {
          return await this.repos.training.computeDifficulty(training.uuid)
        })
      )
    )
  }

  equipments() {
    return new DataLoader<Training, TrainingEquipments[]>(async data =>
      Promise.all(
        data.map(async training => {
          return this.repos.training.getTrainingEquipment(training.id)
        })
      )
    )
  }
}
