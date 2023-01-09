import { Injectable } from '@nestjs/common'
import { TrainingReport } from './trainingReport.entity'
import { ReposService } from '../repos.service'
import DataLoader from 'dataloader'
import { DeepPartial } from 'typeorm'
import { Nullable } from '../../utils/types'
import {
  WeightTrainingReport,
  RunningTrainingReport,
  FitnessTrainingReport,
} from './trainingReport.types'
import getPathLength from 'geolib/es/getPathLength'
import { differenceInSeconds } from 'date-fns'
import { first, last, flatten, orderBy, filter } from 'lodash'
import { TrainingType } from '../training/training.types'
import { ExerciseFormat } from '../exercise/exercise.types'
import { Logger } from '@nestjs/common'
@Injectable()
export class TrainingReportLoader {
  constructor(private readonly repos: ReposService) { }

  weightTrainingReport() {
    return new DataLoader<
      TrainingReport,
      Nullable<DeepPartial<WeightTrainingReport>>
    >(data =>
      Promise.all(
        data.map(async trainingReport => {
          const userTraining = await this.repos.trainingReport.loadUserTraining(
            trainingReport
          )
          const training = await this.repos.userTraining.loadTraining(
            userTraining
          )

          if (training.type !== TrainingType.WEIGHT) return null

          const userProgram = await this.repos.userTraining.loadUserProgram(
            userTraining
          )

          const user = await this.repos.userProgram.loadUser(userProgram)

          const trainingWithExercises = await this.repos.training.getTrainingExercises(
            training.uuid
          )
          const groups = trainingWithExercises.groups
          const groupExercises = flatten(
            groups.map(group => group.groupExercises)
          )
          if (!groupExercises.length) {
            return null
          }
          const groupExercisesFiltered = filter(groupExercises, gE => {
            return gE.format !== ExerciseFormat.TIME
          })
          if (groupExercisesFiltered.length < 2) {
            groupExercisesFiltered.push(
              ...filter(groupExercises, gE => {
                return gE.format == ExerciseFormat.TIME
              }))
          }
          
          const eXWithValue: any = {}
          groupExercisesFiltered.map(groupExercise => {
            if (!eXWithValue[groupExercise.exercise.uuid]) {
              eXWithValue[groupExercise.exercise.uuid] = {
                ex: groupExercise,
              }
              eXWithValue[groupExercise.exercise.uuid]['value'] =
                groupExercise.value
            } else {
              eXWithValue[groupExercise.exercise.uuid]['value'] +=
                groupExercise.value
            }
          })

          const exercisesFullValue = []
          for (const key in eXWithValue) {
            const data: any = eXWithValue[key]
            data.ex.value = data.value
            exercisesFullValue.push(data.ex)
          }

          const orderedByRepsGroupExercises = orderBy(
            exercisesFullValue,
            ['value'],
            ['desc']
          )

          const totalWeight = (await Promise.all(
            orderedByRepsGroupExercises.map(async groupExercise => {
              const weight = await this.repos.groupExercise.getExerciseWeight(
                groupExercise,
                user
              )
              return weight ? weight : 0
            })
          )).reduce((a, b) => a + b, 0)

          const second =
            orderedByRepsGroupExercises.length > 1
              ? {
                exercise: orderedByRepsGroupExercises[1].exercise,
                reps: orderedByRepsGroupExercises[1].value,
              }
              : null

          return {
            first: {
              exercise: orderedByRepsGroupExercises[0].exercise,
              reps: orderedByRepsGroupExercises[0].value,
            },
            second: second,
            totalWeight: totalWeight,
          }
        })
      )
    )
  }

  runningTrainingReport() {
    return new DataLoader<
      TrainingReport,
      Nullable<DeepPartial<RunningTrainingReport>>
    >(data =>
      Promise.all(
        data.map(async trainingReport => {
          const userTraining = await this.repos.trainingReport.loadUserTraining(
            trainingReport
          )
          const runnings = await this.repos.running.findByUserTraining(
            userTraining
          )
          if (!runnings.length) return null
          const distance = runnings
            .map(running => {
              if (!running.locationsData.length) return 0
              const coordsArray = running.locationsData.map(
                locationData => locationData.coordinates
              )
              return getPathLength(coordsArray)
            })
            .reduce((a, b) => a + b, 0)

          const altitude =
            runnings
              .map(running => {
                if (!running.locationsData.length) return 0
                const altPerRunning = running.locationsData.map(
                  locationData => locationData.altitude
                )
                return (
                  altPerRunning.reduce((a, b) => a + b, 0) /
                  running.locationsData.length
                )
              })
              .reduce((a, b) => a + b, 0) / runnings.length

          const time = runnings
            .map(running => {
              if (!running.locationsData.length) return 0
              const firstLocationData = first(running.locationsData)
              const lastLocationData = last(running.locationsData)
              const startTime = new Date(firstLocationData.startedTs)
              const endTime = new Date(lastLocationData.startedTs)
              const diff = differenceInSeconds(endTime, startTime)
              return diff
            })
            .reduce((a, b) => a + b, 0)

          const speed = distance / 1000 / (time / 3600)

          return {
            distance: distance ? Math.round(distance / 1000) : 0,
            speed: distance ? Math.round(speed) : 0,
            altitude: distance ? Math.round(altitude) : 0,
          }
        })
      )
    )
  }

  fitnessTrainingReport() {
    return new DataLoader<
      TrainingReport,
      Nullable<DeepPartial<FitnessTrainingReport>>
    >(data =>
      Promise.all(
        data.map(async trainingReport => {
          const userTraining = await this.repos.trainingReport.loadUserTraining(
            trainingReport
          )
          const training = await this.repos.userTraining.loadTraining(
            userTraining
          )

          if (training.type !== TrainingType.FITNESS) return null

          const trainingWithExercises = await this.repos.training.getTrainingExercises(
            training.uuid
          )
          const groups = trainingWithExercises.groups
          const groupExercises = flatten(
            groups.map(group => group.groupExercises)
          )
          if (!groupExercises.length) {
            return null
          }
          const groupExercisesFiltered = filter(groupExercises, gE => {
            return gE.format !== ExerciseFormat.TIME
          })
          if (groupExercisesFiltered.length < 2) {
            groupExercisesFiltered.push(
              ...filter(groupExercises, gE => {
                return gE.format == ExerciseFormat.TIME
              }))
          }
          const eXWithValue: any = {}
          groupExercisesFiltered.map(groupExercise => {
            if (!eXWithValue[groupExercise.exercise.uuid]) {
              eXWithValue[groupExercise.exercise.uuid] = {
                ex: groupExercise,
              }
              eXWithValue[groupExercise.exercise.uuid]['value'] =
                groupExercise.value
            } else {
              eXWithValue[groupExercise.exercise.uuid]['value'] +=
                groupExercise.value
            }
          })
          const exercisesFullValue = []
          for (const key in eXWithValue) {
            const data: any = eXWithValue[key]
            data.ex.value = data.value
            exercisesFullValue.push(data.ex)
          }
          const orderedByRepsGroupExercises = orderBy(
            exercisesFullValue,
            ['value'],
            ['desc']
          )

          const distance = orderedByRepsGroupExercises
            .map(groupExercise => {
              return groupExercise.value
            })
            .reduce((a, b) => a + b, 0)

          const second =
            orderedByRepsGroupExercises.length > 1
              ? {
                exercise: orderedByRepsGroupExercises[1].exercise,
                reps: orderedByRepsGroupExercises[1].value,
              }
              : null

          return {
            first: {
              exercise: orderedByRepsGroupExercises[0].exercise,
              reps: orderedByRepsGroupExercises[0].value,
            },
            second: second,
            distance: distance,
          }
        })
      )
    )
  }
}
