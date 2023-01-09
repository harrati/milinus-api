import { Injectable } from '@nestjs/common'
import { times, random, sample, map, find } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository, ObjectLiteral, DeepPartial } from 'typeorm'
import Aigle from 'aigle'
import { LibsService } from '../../libs/libs.service'
import { Program } from '../../modules/program/program.entity'
import { Training } from '../../modules/training/training.entity'
import { Group } from '../../modules/group/group.entity'
import { GroupExercise } from '../../modules/groupExercise/groupExercise.entity'
import { Exercise } from '../../modules/exercise/exercise.entity'
import { Evaluation } from '../../modules/evaluation/evaluation.entity'
import { ExerciseFormat } from '../../modules/exercise/exercise.types'
import {
  UserGenders,
  UserSubscriptionStatus,
} from '../../modules/user/user.types'
import {
  UserRunningCapacities,
  UserObjectives,
} from '../../modules/profile/profile.types'
import { GroupType } from '../../modules/group/group.types'
import { System } from '../../modules/system/system.entity'
import { TrainingType } from '../../modules/training/training.types'
import { TrainingGroup } from '../../modules/trainingGroup/trainingGroup.entity'
import programs from '../data/programs.json'
import trainingsContent from '../data/trainings.json'
import { difficultyMapper } from './fixtures.exercise'
import { statusMapper } from './fixtures.recipe'
import { Nullable } from '../../utils/types'

export const runningCapMapper: ObjectLiteral = {
  ['CANT_RUN']: UserRunningCapacities.CANT_RUN,
  ['RUN_15']: UserRunningCapacities.RUN_15,
  ['RUN_30']: UserRunningCapacities.RUN_30,
  ['RUN_60']: UserRunningCapacities.RUN_60,
}

export const offerMapper: ObjectLiteral = {
  ['FREE']: UserSubscriptionStatus.FREE,
  ['PREMIUM']: UserSubscriptionStatus.PREMIUM,
}

export const objectiveMapper: ObjectLiteral = {
  ['BUILD_UP']: UserObjectives.BUILD_UP,
  ['LOOSE_WEIGHT']: UserObjectives.LOOSE_WEIGHT,
  ['STAY_INSHAPE']: UserObjectives.STAY_INSHAPE,
}

export const genderMapper: ObjectLiteral = {
  ['MALE']: UserGenders.MALE,
  ['FEMALE']: UserGenders.FEMALE,
  ['NON_BINARY']: UserGenders.NON_BINARY,
}

export const typeMapper: ObjectLiteral = {
  ['RUNNING']: TrainingType.RUNNING,
  ['WEIGHT']: TrainingType.WEIGHT,
  ['FITNESS']: TrainingType.FITNESS,
}

@Injectable()
export class FixturesProgramService {
  private readonly programRepository: Repository<Program>
  private readonly trainingRepository: Repository<Training>
  private readonly trainingGroupRepository: Repository<TrainingGroup>
  private readonly groupRepository: Repository<Group>
  private readonly groupExerciseRepository: Repository<GroupExercise>
  private readonly exerciseRepository: Repository<Exercise>
  private readonly evaluationRepository: Repository<Evaluation>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.programRepository = connection.getRepository(Program)
    this.exerciseRepository = connection.getRepository(Exercise)
    this.evaluationRepository = connection.getRepository(Evaluation)
    this.trainingGroupRepository = connection.getRepository(TrainingGroup)
    this.trainingRepository = connection.getRepository(Training)
    this.groupRepository = connection.getRepository(Group)
    this.groupExerciseRepository = connection.getRepository(GroupExercise)
  }

  async injectPrograms(
    exercises: Exercise[],
    systems: System[]
  ): Promise<Program[]> {
    console.log('seeding programs...')
    let createdTrainingGroup: TrainingGroup

    const evaluationExercises = await this.exerciseRepository.find({
      format: ExerciseFormat.REPETITION,
    })

    const evaluations = times(programs.length, () => {
      return this.evaluationRepository.create({
        duration: random(30, 50),
        exercise: sample(evaluationExercises),
      })
    })
    await this.evaluationRepository.save(evaluations)

    const programsToCreate = programs.map((program, i) => {
      const {
        difficulty,
        runningCapacity,
        status,
        offer,
        objective,
        gender,
        trainings,
        ...other
      } = program
      return this.programRepository.create({
        ...other,
        difficulty: difficultyMapper[difficulty],
        runningCapacity: runningCapMapper[runningCapacity],
        status: statusMapper[status],
        offer: offerMapper[offer],
        objective: objectiveMapper[objective],
        targetGender: genderMapper[gender],
        system: sample(systems),
        evaluation: evaluations[i],
      })
    })

    const createdPrograms = await this.programRepository.save(programsToCreate)

    console.log('seeding trainings...')
    await Aigle.resolve(createdPrograms).map(async (program: Program) => {
      const { trainings } = find(programs, { secretId: program.secretId })
      const tgToCreate = this.trainingGroupRepository.create({
        program: program,
        default: true,
      })

      createdTrainingGroup = await this.trainingGroupRepository.save(tgToCreate)
      const trainingsToCreate = map(trainings, t => {
        const { id, name, position, type } = t
        return this.trainingRepository.create({
          secretId: id,
          description: ' ',
          program,
          name,
          nameEn: name.replace('JOUR', 'DAY'),
          position,
          type: typeMapper[type],
          trainingGroup: createdTrainingGroup,
        })
      })

      await this.trainingRepository.save(trainingsToCreate)
    })

    console.log('seeding trainings content...')
    await Aigle.resolve(createdPrograms).map(async (program: Program) => {
      const trainings = await this.trainingRepository.find({ program: program })

      const trainingContent: Record<string | number, any> = find(
        trainingsContent,
        { programId: program.secretId }
      )

      await Aigle.resolve(trainings).map(async (training: Training) => {
        const data = trainingContent.trainings[training.secretId]

        await Aigle.resolve(data).map(async (group, i) => {
          const { groupExercises } = group
          const groupToCreate = this.groupRepository.create({
            name: `Groupe ${i + 1}`,
            type: group.finisher ? GroupType.FINISHER : GroupType.DEFAULT,
            position: parseInt(i, 10),
            restTime: group.restTime || 0,
            training,
          })
          const createdGroup = await this.groupRepository.save(groupToCreate)

          const geToCreate = groupExercises.map(
            (e: Record<string, any>, i: number) => {
              const exercise = find(exercises, { secretId: e.exerciseId })
              if (!exercise) {
                if (e.exerciseId !== 'REPOS')
                  console.log('EXERCISE NOT FOUND:', e)
                return null
              }
              return this.groupExerciseRepository.create({
                position: i,
                exercise,
                format: e.format,
                value: e.value || 0,
                group: createdGroup,
              })
            }
          )

          await this.groupExerciseRepository.save(
            geToCreate.filter((e: Nullable<DeepPartial<GroupExercise>>) => e)
          )
        })
      })
    })

    return createdPrograms
  }
}
