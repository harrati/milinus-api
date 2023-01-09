import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Training } from './training.entity'
import { Program } from '../program/program.entity'
import { OrderByDirection, WhereUniqueArgs } from '../../utils/types'
import { TrainingUpdateInput, TrainingCreateInput } from './training.inputs'
import { Group } from '../group/group.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { sum, flatten, without } from 'lodash'
import { GroupExerciseService } from '../groupExercise/groupExercise.service'
import { ExerciseFormat } from '../exercise/exercise.types'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'
import {
  ESTIMATED_REPETITION_TIME,
  AVERAGE_RUNNING_SPEED,
} from '../../utils/constants'
import { ReposService } from '../repos.service'
import { TrainingEquipments } from '../profile/profile.types'

type TrainingFilters = {
  trainingGroup: number
}

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    public readonly trainingRepository: Repository<Training>,
    public readonly groupExerciseService: GroupExerciseService,
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService
  ) {}

  async getTrainings(
    program: Program,
    filters?: TrainingFilters,
    order?: string
  ) {
    const trainings = await this.trainingRepository
      .createQueryBuilder('training')
      .orderBy(`training.position`, OrderByDirection.ASC)
      .where('training."programId" = :programId', { programId: program.id })

    if (filters && filters.trainingGroup) {
      trainings.andWhere('training."trainingGroupId" = :trainingGroup', {
        trainingGroup: filters.trainingGroup,
      })
    }

    if (order) {
      trainings.orderBy(
        `training."${order || 'position'}"`,
        OrderByDirection.ASC
      )
    }

    return await trainings.getMany()
  }

  async findByUuid(uuid: string) {
    return this.trainingRepository.findOne({ uuid })
  }

  deleteByUuid(uuid: string) {
    return this.trainingRepository.delete({ uuid })
  }

  async findProgramForTraining(uuid: string) {
    const { program } = await this.trainingRepository.findOne(
      { uuid },
      { relations: ['program'] }
    )
    return program
  }

  async createTraining(
    trainingPayload: DeepPartial<TrainingCreateInput>
  ): Promise<Training> {
    const training = this.trainingRepository.create(
      trainingPayload as DeepPartial<Training>
    )

    const TrainingCreated = await this.trainingRepository.save(training)
    return TrainingCreated
  }

  async InterMultipleLineTraining(
    ArrayTraing: DeepPartial<TrainingCreateInput[]>,
    program: Program,
    traininggroup: TrainingGroup
  ): Promise<Training[]> {
    const ArrayData: DeepPartial<TrainingCreateInput[]> = []

    ArrayTraing.map(async trainingPayload => {
      const training = this.trainingRepository.create(
        trainingPayload as DeepPartial<Training>
      )
      ArrayData.push(training)
    })
    await this.trainingRepository
      .createQueryBuilder('training')
      .insert()
      .into(Training)
      .values(ArrayData)
      .execute()

    const trainings = this.trainingRepository
      .createQueryBuilder('training')
      .where('training."programId" = :programId', { programId: program.id })
      .andWhere('training."trainingGroupId" = :trainingGroupId', {
        trainingGroupId: traininggroup.id,
      })
      .getMany()
    return trainings
  }

  async updateTraining(
    training: WhereUniqueArgs,
    payload: DeepPartial<TrainingUpdateInput>
  ): Promise<Training> {
    await this.trainingRepository.update(
      { uuid: training.uuid },
      { ...(payload as DeepPartial<Training>) }
    )
    const updatedTraining = await this.trainingRepository.findOneOrFail({
      uuid: training.uuid,
    })
    return updatedTraining
  }

  async getTrainingExercises(uuid: string) {
    const training = await this.trainingRepository
      .createQueryBuilder('t')
      .leftJoinAndMapMany(
        't.groups',
        Group,
        'groups',
        '"t"."id" = "groups"."id"'
      )
      .leftJoinAndMapMany(
        'groups.groupExercises',
        GroupExercise,
        'gE',
        '"groups"."id" = "gE"."groupId"'
      )
      .leftJoinAndSelect('gE.exercise', 'exrcises')
      .where('t.uuid = :uuid', { uuid })
      .getOne()

    return training
  }

  async computeDifficulty(uuid: string): Promise<number> {
    const training = await this.trainingRepository
      .createQueryBuilder('t')
      .leftJoinAndMapMany(
        't.groups',
        Group,
        'groups',
        '"t"."id" = "groups"."id"'
      )
      .leftJoinAndMapMany(
        'groups.groupExercises',
        GroupExercise,
        'gE',
        '"groups"."id" = "gE"."groupId"'
      )
      .leftJoinAndSelect('gE.exercise', 'exrcises')
      .where('t.uuid = :uuid', { uuid })
      .getOne()

    const groups = training.groups
    const groupExercises = flatten(groups.map(group => group.groupExercises))
    const groupsDifficulty: number[] = groupExercises.map(groupExercise =>
      this.groupExerciseService.computeDifficulty(groupExercise)
    )
    const result = sum(groupsDifficulty) / groupsDifficulty.length
    return Math.floor(result * 100) / 100
  }

  async computeDuration(id: number): Promise<number> {
    const groups = await this.repos.group.groupRepository
      .createQueryBuilder('g')
      .leftJoinAndMapMany(
        'g.groupExercises',
        GroupExercise,
        'ge',
        'g."id" = "ge"."groupId"'
      )
      .where('g."trainingId" = :id', { id })
      .getMany()

    const groupTimes = groups.map(group => {
      const time = group.groupExercises
        .map(groupExercise => {
          if (groupExercise.format === ExerciseFormat.REPETITION) {
            return groupExercise.value * ESTIMATED_REPETITION_TIME
          }
          if (groupExercise.format === ExerciseFormat.METER) {
            return groupExercise.value / AVERAGE_RUNNING_SPEED
          }
          if (groupExercise.format === ExerciseFormat.TIME) {
            return groupExercise.value
          }
        })
        .reduce((a, b) => a + b, 0)
      return group.restTime + time
    })
    return Math.round(groupTimes.reduce((a, b) => a + b, 0))
  }
  async getTrainingEquipment(trainingId: number) {
    const qb = this.trainingRepository
      .createQueryBuilder('training')
      .leftJoinAndMapMany(
        'training.groups',
        Group,
        'groups',
        '"training"."id" = "groups"."trainingId"'
      )
      .leftJoinAndMapMany(
        'groups.groupExercises',
        GroupExercise,
        'ge',
        '"groups"."id" = "ge"."groupId"'
      )
      .leftJoinAndSelect('ge.exercise', 'exercises')
      .select('json_agg(DISTINCT(exercises.equipments))', 'equipmentArray')
      .where('training.id = :id', { id: trainingId })

    const result = await qb.getRawOne()
    return without(
      flatten(result.equipmentArray) as TrainingEquipments[],
      null,
      TrainingEquipments.NONE
    )
  }
}
