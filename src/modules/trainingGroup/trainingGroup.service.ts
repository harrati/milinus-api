import { Injectable } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { flatten, sum, isFinite, pick } from 'lodash'
import { InjectRepository } from '@nestjs/typeorm'
import { TrainingGroup } from './trainingGroup.entity'
import { Program } from '../program/program.entity'
import { Group } from '../group/group.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { Training } from '../training/training.entity'
import { GroupExerciseService } from '../groupExercise/groupExercise.service'
import { TrainingGroupDifficulty } from './trainingGroup.types'
import { WhereUniqueArgs } from '../../utils/types'
import { GroupService } from '../group/group.service'
import { TrainingService } from '../training/training.service'
import { TrainingCreateInput } from '../training/training.inputs'

@Injectable()
export class TrainingGroupService {
  constructor(
    public readonly groupExerciseService: GroupExerciseService,
    public readonly groupService: GroupService,
    public readonly trainingService: TrainingService,
    @InjectRepository(TrainingGroup)
    public readonly trainingGroupRepository: Repository<TrainingGroup>
  ) {}

  async loadDefaultTrainingGroup(program: Program): Promise<TrainingGroup> {
    return this.trainingGroupRepository.findOneOrFail({
      where: {
        default: true,
        program: program,
      },
      relations: ['trainings'],
    })
  }

  async getTrainingGroupWithTrainings(
    trainingGroup: TrainingGroup
  ): Promise<TrainingGroup> {
    return this.trainingGroupRepository.findOneOrFail({
      where: {
        uuid: trainingGroup.uuid,
      },
      relations: ['trainings'],
    })
  }

  async findByUuid(uuid: string) {
    return await this.trainingGroupRepository.findOne(
      { uuid },
      { relations: ['program'] }
    )
  }

  async createDuplicateOld(uuid: string, program?: Program) {
    const trainingGroup = await this.trainingGroupRepository
      .createQueryBuilder('tg')
      .leftJoinAndSelect('tg.trainings', 'trainings')
      .leftJoinAndMapOne(
        'trainings.program',
        Program,
        'program',
        '"program"."id" = "trainings"."programId"'
      )
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
      .where('tg.uuid = :uuid', { uuid })
      .getOne()

    const trainingGroupPayload: DeepPartial<TrainingGroup> = {
      default: program ? trainingGroup.default : false,
      program: program ? program : trainingGroup.program,
    }
    const trainingGroupCreated = await this.create(trainingGroupPayload)
    await Promise.all(
      trainingGroup.trainings.map(async training => {
        const trainingPayload: DeepPartial<Training> = {
          ...pick(training, ['name', 'description', 'position', 'type']),
          trainingGroup: trainingGroupCreated,
          program: program ? program : trainingGroup.program,
        }
        const trainingCreated = await this.trainingService.createTraining(
          trainingPayload
        )
        await Promise.all(
          training.groups.map(async group => {
            const groupPayload: DeepPartial<Group> = {
              ...pick(group, ['name', 'position', 'restTime', 'type']),
              training: trainingCreated,
            }
            const groupCreated = await this.groupService.createGroup(
              groupPayload
            )
            await Promise.all(
              group.groupExercises.map(async groupExercise => {
                const groupExercisePayload: DeepPartial<GroupExercise> = {
                  ...pick(groupExercise, ['position', 'value', 'format']),
                  group: groupCreated,
                  exercise: groupExercise.exercise,
                }
                await this.groupExerciseService.createGroupExercise(
                  groupExercisePayload
                )
              })
            )
          })
        )
      })
    )
    return trainingGroupCreated
  }

  async createDuplicate(uuid: string, program?: Program) {
    const trainingGroup = await this.trainingGroupRepository
      .createQueryBuilder('tg')
      .leftJoinAndSelect('tg.trainings', 'trainings')
      .leftJoinAndMapOne(
        'trainings.program',
        Program,
        'program',
        '"program"."id" = "trainings"."programId"'
      )
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
      .where('tg.uuid = :uuid', { uuid })
      .getOne()

    const trainingGroupPayload: DeepPartial<TrainingGroup> = {
      default: program ? trainingGroup.default : false,
      program: program
        ? program
        : trainingGroup.trainings.length > 0
        ? trainingGroup.trainings[0].program
        : null,
    }
    const trainingGroupCreated = await this.create(trainingGroupPayload)

    const arrayToSaveTrainings: DeepPartial<TrainingCreateInput[]> = []
    const arrayGroupsTrainings: any = []
    trainingGroup.trainings.map(training => {
      const trainingPayload: DeepPartial<Training> = {
        ...pick(training, ['name', 'description', 'position', 'type']),
        trainingGroup: trainingGroupCreated,
        program: program
          ? program
          : trainingGroup.trainings.length > 0
          ? trainingGroup.trainings[0].program
          : null,
      }
      arrayToSaveTrainings.push(trainingPayload)
      arrayGroupsTrainings.push(training.groups)
    })

    //Trainings created
    const ProgramElt: Program = program
      ? program
      : trainingGroup.trainings.length > 0
      ? trainingGroup.trainings[0].program
      : null

    const ensTraingsCreators = await this.trainingService.InterMultipleLineTraining(
      arrayToSaveTrainings,
      ProgramElt,
      trainingGroupCreated
    )

    //Groupes Created
    ensTraingsCreators.map(async (trainingCreated, indice) => {
      arrayGroupsTrainings[indice].map(async (group: any) => {
        const groupPayload: DeepPartial<Group> = {
          ...pick(group, ['name', 'position', 'restTime', 'type']),
          training: trainingCreated,
        }
        const groupCreated = await this.groupService.createGroup(groupPayload)
        await Promise.all(
          group.groupExercises.map(async (groupExercise: any) => {
            const groupExercisePayload: DeepPartial<GroupExercise> = {
              ...pick(groupExercise, ['position', 'value', 'format']),
              group: groupCreated,
              exercise: groupExercise.exercise,
            }
            await this.groupExerciseService.createGroupExercise(
              groupExercisePayload
            )
          })
        )
      })
    })

    return trainingGroupCreated
  }

  async deleteByUuid(uuid: string) {
    return await this.trainingGroupRepository.delete({ uuid })
  }

  async create(
    trainingGroupPayload: DeepPartial<TrainingGroup>
  ): Promise<TrainingGroup> {
    const trainingGroup = this.trainingGroupRepository.create(
      trainingGroupPayload as DeepPartial<TrainingGroup>
    )
    return await this.trainingGroupRepository.save(trainingGroup)
  }
  async update(
    trainingGroup: WhereUniqueArgs,
    payload: DeepPartial<TrainingGroup>
  ): Promise<TrainingGroup> {
    await this.trainingGroupRepository.update(
      { uuid: trainingGroup.uuid },
      { ...(payload as DeepPartial<TrainingGroup>) }
    )
    const updatedTrainingGroup = await this.trainingGroupRepository.findOneOrFail(
      {
        uuid: trainingGroup.uuid,
      }
    )
    return updatedTrainingGroup
  }

  async findByProgramUuid(uuid: string) {
    const groups = await this.trainingGroupRepository
      .createQueryBuilder('tg')
      .innerJoinAndSelect('tg.trainings', 'trainings')
      .innerJoinAndSelect('trainings.program', 'prog', 'prog.uuid = :uuid', {
        uuid,
      })
      .getMany()
    return groups
  }

  async getReferenceGroupForProgram(uuid: string) {
    const group = await this.trainingGroupRepository
      .createQueryBuilder('tg')
      .leftJoinAndSelect('tg.program', 'prog')
      .where('prog.uuid = :uuid', { uuid })
      .andWhere('tg.default = true')
      .getOne()
    return group
  }

  async computeDifficulty(uuid: string): Promise<number> {
    const trainingGroup = await this.trainingGroupRepository
      .createQueryBuilder('tg')
      .leftJoinAndSelect('tg.trainings', 'trainings')
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
      .where('tg.uuid = :uuid', { uuid })
      .getOne()

    const trainingsDifficulty = trainingGroup.trainings.map(
      (training: Training) => {
        const groups = training.groups
        const groupExercises = flatten(
          groups.map(group => group.groupExercises)
        )
        const groupsDifficulty: number[] = groupExercises.map(groupExercise =>
          this.groupExerciseService.computeDifficulty(groupExercise)
        )
        return sum(groupsDifficulty) / groupsDifficulty.length
      }
    )

    const trainingsDifficultyFiltered = trainingsDifficulty.filter(value =>
      isFinite(value)
    )
    const result =
      sum(trainingsDifficultyFiltered) / trainingsDifficultyFiltered.length
    return Math.floor(result * 100) / 100
  }

  async getAllProgramDifficulties(
    program: Program
  ): Promise<TrainingGroupDifficulty[]> {
    const trainingGroups = await this.findByProgramUuid(program.uuid)
    return await Promise.all(
      trainingGroups.map(async trainingGroup => {
        const difficulty = await this.computeDifficulty(trainingGroup.uuid)
        return {
          id: trainingGroup.id,
          difficulty,
        }
      })
    )
  }
}
