import { Injectable } from '@nestjs/common'
import { Program } from './program.entity'
import { User } from '../user/user.entity'
import { intersection, flattenDeep, uniq, orderBy } from 'lodash'
import {
  userRunningMapper,
  userObjectiveMapperZeroIndexed,
  userGenderMapper,
} from '../../utils/enumMapper'
import {
  runningPointsMatrix,
  objectivePointsMatrix,
  genderPointsMatrix,
  bodyZonePoints,
} from '../../utils/constants'
import { InjectRepository } from '@nestjs/typeorm'
import { UserProgram } from '../userProgram/userProgram.entity'
import { Repository } from 'typeorm'

type ProgramPoints = {
  points: number
  program: Program
}
@Injectable()
export class ProgramOrderingService {
  private programs: Program[]
  private user: User

  constructor(
    @InjectRepository(UserProgram)
    public readonly userProgramRepository: Repository<UserProgram>
  ) {}

  public async order(programs: Program[], user: User) {
    this.programs = programs
    this.user = user
    const programPoints = await Promise.all<ProgramPoints>(
      programs.map(async program => {
        const points =
          this.calculateRunningPoints(program) +
          this.calculatePbjectivePoints(program) +
          this.calculateGenderPoints(program) +
          this.calculateBodyZonePoints(program) +
          (await this.calculateCompletedProgramPoints(program))
        return { points, program }
      })
    )
    const orderedPrograms = orderBy(programPoints, ['points'], ['desc'])

    const orderedProgramsWithoutPoints = orderedPrograms.map(
      orderedProgram => orderedProgram.program
    )
    return orderedProgramsWithoutPoints
  }
  calculateRunningPoints(program: Program) {
    return runningPointsMatrix[userRunningMapper[program.runningCapacity]][
      userRunningMapper[this.user.runningCapacity]
    ]
  }

  calculatePbjectivePoints(program: Program) {
    return objectivePointsMatrix[
      userObjectiveMapperZeroIndexed[program.objective]
    ][userObjectiveMapperZeroIndexed[this.user.objective]]
  }

  calculateGenderPoints(program: Program) {
    let points =
      genderPointsMatrix[userGenderMapper[program.targetGender]][
        userGenderMapper[this.user.gender]
      ]
    if (program.targetGender === this.user.gender) points += 100
    if (program.targetGender !== this.user.gender) points -= 50
    return points
  }

  calculateBodyZonePoints(program: Program) {
    const programBodyZones = uniq(
      flattenDeep(
        program.trainings.map(training => {
          return training.groups.map(group => {
            return group.groupExercises.map(groupExercise => {
              const e = groupExercise.exercise
              const areasArray = []
              if (e.primaryBodyArea) areasArray.push(e.primaryBodyArea)
              if (e.primaryBodyArea) areasArray.push(e.secondaryBodyArea)
              if (e.primaryBodyArea) areasArray.push(e.tertiaryBodyArea)
              return areasArray
            })
          })
        })
      )
    )
    return bodyZonePoints[
      intersection(programBodyZones, this.user.targetedBodyAreas).length
    ]
  }

  async calculateCompletedProgramPoints(program: Program) {
    const programCompleted = !!(await this.getCompletedProgram(
      this.user,
      program
    ))
    return programCompleted ? -100 : 0
  }

  async getCompletedProgram(user: User, program: Program) {
    return await this.userProgramRepository
      .createQueryBuilder('prog')
      .where('prog."userId" = :userId', { userId: user.id })
      .andWhere('prog."programId" = :programId', { programId: program.id })
      .andWhere('prog."completedAt" IS NOT NULL')
      .getOne()
  }
}
