import { buildProgramExerciseFilters } from './program.utils'
import {  Injectable, flatten } from '@nestjs/common'
import { Repository, DeepPartial, SimpleConsoleLogger } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  chain,
  concat,
  uniq,
  pull,
  omit,
  head,
  intersection,
  isEqual,
} from 'lodash'
import { Program } from './program.entity'
import { LibsService } from '../../libs/libs.service'
import { User } from '../user/user.entity'
import { Exercise } from '../exercise/exercise.entity'
import {
  ToggleStatus,
  OrderByDirection,
  WhereUniqueInput,
  OrderName,
} from '../../utils/types'
import {
  BodyAreas,
  UserTrainingFrequencies,
  UserRunningCapacities,
  TrainingEquipments,
  UserObjectives,
} from '../profile/profile.types'
import { ProgramOfferType } from './program.types'
import { ExerciseTypes } from '../exercise/exercise.types'
import { UserGenders } from '../user/user.types'
import { CreateProgramArgs, UpdateProgramInput } from './program.inputs'
import { Evaluation } from '../evaluation/evaluation.entity'
import { System } from '../system/system.entity'
import { Group } from '../group/group.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { ProgramOrderingService } from './program.ordering.service'

type ProgramFilters = {
  difficulty?: UserTrainingFrequencies
  types?: ExerciseTypes[]
  bodyAreas?: BodyAreas[]
  status?: ToggleStatus
  gender?: UserGenders
  search?: string
  runningFrequency?: UserRunningCapacities
  objective?: UserObjectives
  duration?: number
  equipment?: TrainingEquipments[]
  offer?: ProgramOfferType
}

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    public readonly programRepository: Repository<Program>,
    private readonly libs: LibsService,
    private readonly programOrdering: ProgramOrderingService
  ) {}

  async getUserPrograms(
    user: User,
    first?: number,
    after?: string,
    offer?: ProgramOfferType
  ) {
    const extendedEquiments = [TrainingEquipments.NONE, ...user.equipments]
    const qb =
      offer === ProgramOfferType.ALL || !offer
        ? this.programRepository
            .createQueryBuilder('program')
            .leftJoinAndSelect('program.trainings', 'trainings')
            .leftJoinAndMapMany(
              'trainings.groups',
              Group,
              'groups',
              '"trainings"."id" = "groups"."trainingId"'
            )
            .leftJoinAndMapMany(
              'groups.groupExercises',
              GroupExercise,
              'ge',
              '"groups"."id" = "ge"."groupId"'
            )
            .leftJoinAndSelect('ge.exercise', 'exercises')
            .andWhere('program.difficulty = :difficulty', {
              difficulty: user.trainingFrequency,
            })
            .andWhere('program.status = :status', {
              status: ToggleStatus.ACTIVE,
            })
        : offer === ProgramOfferType.FREE
        ? this.programRepository
            .createQueryBuilder('program')
            .leftJoinAndSelect('program.trainings', 'trainings')
            .leftJoinAndMapMany(
              'trainings.groups',
              Group,
              'groups',
              '"trainings"."id" = "groups"."trainingId"'
            )
            .leftJoinAndMapMany(
              'groups.groupExercises',
              GroupExercise,
              'ge',
              '"groups"."id" = "ge"."groupId"'
            )
            .leftJoinAndSelect('ge.exercise', 'exercises')
            .andWhere('program.status = :status', {
              status: ToggleStatus.ACTIVE,
            })
            .andWhere('program.offer = :offer', {
              offer,
            })
        : this.programRepository
            .createQueryBuilder('program')
            .leftJoinAndSelect('program.trainings', 'trainings')
            .leftJoinAndMapMany(
              'trainings.groups',
              Group,
              'groups',
              '"trainings"."id" = "groups"."trainingId"'
            )
            .leftJoinAndMapMany(
              'groups.groupExercises',
              GroupExercise,
              'ge',
              '"groups"."id" = "ge"."groupId"'
            )
            .leftJoinAndSelect('ge.exercise', 'exercises')
            .andWhere('program.difficulty = :difficulty', {
              difficulty: user.trainingFrequency,
            })
            .andWhere('program.status = :status', {
              status: ToggleStatus.ACTIVE,
            })
            .andWhere('program.offer = :offer', {
              offer,
            })

    const programs = await qb.getMany()
    const programsFilteredWithEquipment =
      offer !== ProgramOfferType.FREE
        ? await Promise.all<Program>(
            programs.map(async program => {
              const equipments = (await this.getProgramEquipment(
                program.id
              )).filter(x => x != null)
              const userHaveEquipment = equipments.every(
                (eq: TrainingEquipments) => extendedEquiments.includes(eq)
              )
              return userHaveEquipment ? program : null
            })
          )
        : programs
    const orderedPrograms = await this.programOrdering.order(
      programsFilteredWithEquipment.filter(x => x != null),
      user
    )

    const paginator = this.libs.paginator.getPaginator(Program, {
      first,
      after,
    })
    return await paginator.manualPaginate(qb, orderedPrograms)
  }

  async getProgramEquipment(programId: number) {
    const qb = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.trainings', 'trainings')
      .leftJoinAndMapMany(
        'trainings.groups',
        Group,
        'groups',
        '"trainings"."id" = "groups"."trainingId"'
      )
      .leftJoinAndMapMany(
        'groups.groupExercises',
        GroupExercise,
        'ge',
        '"groups"."id" = "ge"."groupId"'
      )
      .leftJoinAndSelect('ge.exercise', 'exercises')
      .select('json_agg(DISTINCT(exercises.equipments))', 'equipmentArray')
      .where('program.id = :id', { id: programId })

    const result = await qb.getRawOne()

    if (
      result.equipmentArray.length === 1 &&
      head(result.equipmentArray) === TrainingEquipments.NONE
    ) {
      return flatten(result.equipmentArray) as TrainingEquipments[]
    }
    return flatten(
      result.equipmentArray.filter(
        (x: TrainingEquipments) => x != TrainingEquipments.NONE
      )
    ) as TrainingEquipments[]
  }

  async getProgramsEquipment(programId: number) {
    const qb = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.trainings', 'trainings')
      .leftJoinAndMapMany(
        'trainings.groups',
        Group,
        'groups',
        '"trainings"."id" = "groups"."trainingId"'
      )
      .leftJoinAndMapMany(
        'groups.groupExercises',
        GroupExercise,
        'ge',
        '"groups"."id" = "ge"."groupId"'
      )
      .leftJoinAndSelect('ge.exercise', 'exercises')
      .select('json_agg(DISTINCT(exercises.equipments))', 'equipmentArray')
      .where('program.id = :id', { id: programId })

    const result = await qb.getRawOne()

    return flatten(result.equipmentArray) as TrainingEquipments[]
  }

  async getProgramBodyAreas(programId: number) {
    const qb = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.trainings', 'trainings')
      .leftJoinAndMapMany(
        'trainings.groups',
        Group,
        'groups',
        '"trainings"."id" = "groups"."trainingId"'
      )
      .leftJoinAndMapMany(
        'groups.groupExercises',
        GroupExercise,
        'ge',
        '"groups"."id" = "ge"."groupId"'
      )
      .leftJoinAndSelect('ge.exercise', 'exercises')
      .select(
        'json_agg(DISTINCT(exercises."primaryBodyArea"))',
        'primaryBodyArea'
      )
      .addSelect(
        'json_agg(DISTINCT(exercises."secondaryBodyArea"))',
        'secondaryBodyArea'
      )
      .addSelect(
        'json_agg(DISTINCT(exercises."tertiaryBodyArea"))',
        'tertiaryBodyArea'
      )
      .where('program.id = :id', { id: programId })

    const result = await qb.getRawOne()

    const bodyAreas = pull(
      uniq(
        concat(
          result.primaryBodyArea,
          result.secondaryBodyArea,
          result.tertiaryBodyArea
        )
      ),
      null
    )

    return bodyAreas
  }

  async getPrograms(
    filters?: ProgramFilters,
    first = 10,
    after?: string,
    order = OrderByDirection.ASC,
    orderBy = OrderName.name
  ) {
    const qb = this.programRepository.createQueryBuilder('program')

    if (filters && filters.difficulty) {
      qb.andWhere('program.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      })
    }

    if (filters && filters.offer && filters.offer !== ProgramOfferType.ALL) {
      qb.andWhere('program.offer = :offer', {
        offer: filters.offer,
      })
    }

    if (filters && filters.gender) {
      qb.andWhere('program.targetGender = :gender', {
        gender: filters.gender,
      })
    }

    if (filters && filters.runningFrequency) {
      qb.andWhere('program.runningCapacity = :runningCapacity', {
        runningCapacity: filters.runningFrequency,
      })
    }

    if (filters && filters.objective) {
      qb.andWhere('program.objective = :objective', {
        objective: filters.objective,
      })
    }

    if (filters && filters.duration) {
      qb.andWhere('program.duration = :duration', {
        duration: filters.duration,
      })
    }

    if (filters && filters.types && filters.types.length) {
      qb.andWhere(programQb =>
        buildProgramExerciseFilters(
          programQb,
          groupExerciseQb => {
            const exerciseQuery = groupExerciseQb
              .subQuery()
              .select('e.id')
              .from(Exercise, 'e')
              .where('e."type" IN (:...types)', { types: filters.types })
              .getQuery()
            return 'ge."exerciseId" IN ' + exerciseQuery
          },
          'IN'
        )
      )
    }

    if (filters && filters.bodyAreas && filters.bodyAreas.length) {
      qb.andWhere(programQb =>
        buildProgramExerciseFilters(
          programQb,
          groupExerciseQb => {
            const exerciseQuery = groupExerciseQb
              .subQuery()
              .select('e.id')
              .from(Exercise, 'e')
              .where('e."primaryBodyArea" IN (:...bodyAreas)', {
                bodyAreas: filters.bodyAreas,
              })
              .orWhere('e."secondaryBodyArea" IN (:...bodyAreas)', {
                bodyAreas: filters.bodyAreas,
              })
              .getQuery()
            return 'ge."exerciseId" IN ' + exerciseQuery
          },
          'IN'
        )
      )
    }

    if (filters && filters.equipment) {
      const qbSub = this.programRepository.createQueryBuilder('program')
      const allPrograms = await qbSub.getMany()

      if (
        filters.equipment.length === 1 &&
        head(filters.equipment) === TrainingEquipments.NONE
      ) {
      } else {
        filters.equipment.push(TrainingEquipments.BENCH)
        filters.equipment.push(TrainingEquipments.NONE)
        filters.equipment = uniq(filters.equipment)
      }

      const programsFilteredWithEquipment = await Promise.all<Program>(
        allPrograms.map(async (program: Program) => {
          const equipments = (await this.getProgramsEquipment(
            program.id
          )).filter(x => x != null)
          const programHaveEquipment = isEqual(
            equipments.sort(),
            filters.equipment.sort()
          )
          return programHaveEquipment ? program : null
        })
      )

      const ids = programsFilteredWithEquipment
        .filter(x => x !== null)
        .map((program: Program) => {
          return program.id
        })

      if (ids.length === 0) {
        ids.push(null)
      }

      qb.andWhere('program.id IN (:...ids)', {
        ids,
      })
    }

    if (filters && filters.status) {
      qb.andWhere('program.status = :status', {
        status: filters.status,
      })
    }

    if (filters && filters.search) {
      qb.andWhere('LOWER(program."name") LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      })
    }

    const paginator = this.libs.paginator.getPaginator(Program, {
      orderBy: orderBy,
      orderByDirection: order,
      first,
      after,
    })

    const connection = await paginator.paginate(qb)
    return connection
  }

  findByUuid(uuid: string) {
    return this.programRepository.findOne({ uuid })
  }

  async trainingDifficulties(program: any) {
    const trainings = await this.loadTrainings(program)
    return chain(trainings)
      .map('difficulty')
      .uniq()
      .sort()
      .value()
  }

  async loadTrainings(program: Program) {
    const { trainings } = await this.programRepository.findOneOrFail(
      program.id,
      {
        relations: ['trainings'],
      }
    )
    return trainings
  }

  async getEvaluationForProgram(program: Program): Promise<Evaluation> {
    const { evaluation } = await this.programRepository.findOneOrFail(
      program.id,
      {
        relations: ['evaluation'],
      }
    )
    return evaluation
  }

  async getSystemForProgram(program: Program): Promise<System> {
    const { system } = await this.programRepository.findOneOrFail(program.id, {
      relations: ['system'],
    })
    return system
  }

  async createProgram(
    programPayload: DeepPartial<CreateProgramArgs>
  ): Promise<Program> {
    const program = this.programRepository.create(programPayload as DeepPartial<
      Program
    >)
    return await this.programRepository.save(program)
  }

  async updateProgram(
    program: WhereUniqueInput,
    payload: DeepPartial<UpdateProgramInput>
  ): Promise<Program> {
    await this.programRepository.update(
      { uuid: program.uuid },
      { ...(payload as DeepPartial<Program>) }
    )
    const updatedProgram = await this.programRepository.findOneOrFail({
      uuid: program.uuid,
    })
    return updatedProgram
  }

  async deleteByUuid(uuid: string) {
    return await this.programRepository.delete({ uuid })
  }

  async duplicate(uuid: string) {
    const originalProgram = await this.programRepository.findOne({ uuid })
    const programPayload = {
      ...omit(originalProgram, [
        'id',
        'uuid',
        'secretId',
        'createdAt',
        'updatedAt',
      ]),
      system: await this.getSystemForProgram(originalProgram),
    }
    programPayload.name = programPayload.name + ' [COPY]'
    const program = this.programRepository.create(programPayload as DeepPartial<
      Program
    >)

    return await this.programRepository.save(program)
  }

  private userHaveRequiredEquipment(equipment: TrainingEquipments[]) {
    const requiredEquipment = [
      TrainingEquipments.DUMBBELL,
      TrainingEquipments.DRAW_BAR,
      TrainingEquipments.WEIGHT_BAR,
    ]
    const intersectionArray = intersection(requiredEquipment, equipment)
    return intersectionArray.length >= 3
  }
}
