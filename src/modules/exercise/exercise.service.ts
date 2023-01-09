import { Injectable } from '@nestjs/common'
import { Repository, DeepPartial, Brackets } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LibsService } from '../../libs/libs.service'
import { Exercise } from './exercise.entity'
import { Training } from '../training/training.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { Group } from '../group/group.entity'
import {
  UserTrainingFrequencies,
  BodyAreas,
  TrainingEquipments,
} from '../profile/profile.types'
import { ExerciseTypes, ExerciseFormat } from './exercise.types'
import {
  ToggleStatus,
  WhereUniqueInput,
  OrderByDirection,
  OrderName,
} from '../../utils/types'
import { CreateExerciseArgs, ExerciseUpdateInput } from './exercises.inputs'
import { omit } from 'lodash'

type ExerciseFilters = {
  difficulty?: UserTrainingFrequencies
  types?: ExerciseTypes[]
  bodyAreas?: BodyAreas[]
  status?: ToggleStatus
  format?: ExerciseFormat[]
  equipments?: TrainingEquipments[]
  search?: string
}

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    public readonly exerciseRepository: Repository<Exercise>,
    private readonly libs: LibsService
  ) {}

  findByUuid(uuid: string) {
    return this.exerciseRepository.findOne({ uuid })
  }

  findByProgramUuid(uuid: string) {
    return this.exerciseRepository.findOne({ uuid })
  }

  deleteByUuid(uuid: string) {
    return this.exerciseRepository.delete({ uuid })
  }

  async getExercises(
    filters?: ExerciseFilters,
    first = 10,
    after?: string,
    order = OrderByDirection.ASC,
    orderName = OrderName.name
  ) {
    const qb = this.exerciseRepository.createQueryBuilder('exercise')

    if (filters && filters.difficulty) {
      qb.andWhere('exercise."difficulty" = :difficulty', {
        difficulty: filters.difficulty,
      })
    }

    if (filters && filters.types && filters.types.length) {
      qb.andWhere('exercise."type" IN (:...types)', {
        types: filters.types,
      })
    }

    if (filters && filters.format && filters.format.length) {
      qb.andWhere(
        new Brackets(qb => {
          qb.andWhere('exercise."format" IN (:...format)', {
            format: filters.format,
          }).orWhere('exercise."secondaryFormat" IN (:...format)', {
            format: filters.format,
          })
        })
      )
    }

    if (filters && filters.equipments && filters.equipments.length) {
      qb.andWhere('exercise."equipments" @> (:equipments)', {
        equipments: filters.equipments,
      })
    }

    if (filters && filters.bodyAreas && filters.bodyAreas.length) {
      qb.andWhere(
        new Brackets(qb => {
          qb.andWhere('exercise."primaryBodyArea" IN (:...bodyAreas)', {
            bodyAreas: filters.bodyAreas,
          })
            .orWhere('exercise."secondaryBodyArea" IN (:...bodyAreas)', {
              bodyAreas: filters.bodyAreas,
            })
            .orWhere('exercise."tertiaryBodyArea" IN (:...bodyAreas)', {
              bodyAreas: filters.bodyAreas,
            })
        })
      )
    }

    if (filters && filters.status) {
      qb.andWhere('exercise."status" = :status', {
        status: filters.status,
      })
    }

    if (filters && filters.search) {
      qb.andWhere('LOWER(exercise."name") LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      })
    }

    const paginator = this.libs.paginator.getPaginator(Exercise, {
      orderBy: orderName,
      orderByDirection: order,
      first,
      after,
    })
    const connection = await paginator.paginate(qb)

    return connection
  }

  getTrainingExercises(training: Training) {
    return this.exerciseRepository
      .createQueryBuilder('e')
      .where(ex => {
        const geQuery = ex
          .subQuery()
          .select('ge."exerciseId"')
          .from(GroupExercise, 'ge')
          .where(ge => {
            const gQuery = ge
              .subQuery()
              .select('g.id')
              .from(Group, 'g')
              .where('g."trainingId" = :trainingId', {
                trainingId: training.id,
              })
              .getQuery()
            return 'ge."groupId" IN ' + gQuery
          })
          .getQuery()
        return 'e.id IN ' + geQuery
      })
      .getMany()
  }

  async createExercise(
    exercisePayload: DeepPartial<CreateExerciseArgs>
  ): Promise<Exercise> {
    const exercise = this.exerciseRepository.create(
      exercisePayload as DeepPartial<Exercise>
    )
    return await this.exerciseRepository.save(exercise)
  }

  async updateExercise(
    exercise: WhereUniqueInput,
    payload: DeepPartial<ExerciseUpdateInput>
  ): Promise<Exercise> {
    await this.exerciseRepository.update(
      { uuid: exercise.uuid },
      { ...(payload as DeepPartial<Exercise>) }
    )
    const updatedExercise = await this.exerciseRepository.findOneOrFail({
      uuid: exercise.uuid,
    })
    return updatedExercise
  }

  async copyExercise(uuid: string) {
    const exercise = await this.findByUuid(uuid)

    const exerciseData: DeepPartial<Exercise> = {
      ...omit(exercise, ['id', 'uuid', 'secretId', 'createdAt', 'updatedAt']),
    }

    const createdExercise = this.exerciseRepository.create(exerciseData)
    return await this.exerciseRepository.save(createdExercise)
  }
}
