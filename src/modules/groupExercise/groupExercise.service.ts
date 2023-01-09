import { Injectable } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { GroupExercise } from './groupExercise.entity'
import { Group } from '../group/group.entity'
import { Exercise } from '../exercise/exercise.entity'
import { User } from '../user/user.entity'
import { brzycki } from './groupExercise.utils'
import { OrderByDirection, WhereUniqueInput } from '../../utils/types'
import { ExerciseReferences } from '../exercise/exercise.types'
import { find, omit, reduce } from 'lodash'
import { DIFFICULTY_STEP } from '../../utils/constants'

@Injectable()
export class GroupExerciseService {
  constructor(
    @InjectRepository(GroupExercise)
    private readonly groupExerciseRepository: Repository<GroupExercise>
  ) { }

  async copyGroupExercise(sourceGroupExercise: GroupExercise, targetGroup: Group) {
    const exerciseData: DeepPartial<GroupExercise> = {
      ...omit(sourceGroupExercise, ['id', 'uuid', 'createdAt', 'updatedAt']),
    }
    exerciseData.group = targetGroup
    exerciseData.exercise = await this.getExercise(sourceGroupExercise)
    const targetGroupExercise = this.groupExerciseRepository.create(exerciseData)
    return await this.groupExerciseRepository.save(targetGroupExercise)
  }
  async getGroupExercises(group: Group) {
    const groups = await this.groupExerciseRepository
      .createQueryBuilder('ge')
      .where('ge."groupId" = :groupId', { groupId: group.id })
      .orderBy('ge.position', OrderByDirection.ASC)
      .getMany()
    return groups
  }

  async reorderGroupExercises(group: Group, position: number, up: boolean) {
    await this.groupExerciseRepository
      .createQueryBuilder('ge')
      .update()
      .set({
        position: () => `position ${up ? '+' : '-'} 1`,
      })
      .where('position >= :position', { position })
      .andWhere('group = :groupId', { groupId: group.id })
      .execute()
  }

  async findByUuid(uuid: string) {
    return this.groupExerciseRepository.findOne(
      { uuid },
      { relations: ['group'] }
    )
  }

  async getExercise(groupExercise: GroupExercise) {
    const exercise = (await this.groupExerciseRepository
      .createQueryBuilder('ge')
      .relation(GroupExercise, 'exercise')
      .of(groupExercise)
      .loadOne()) as Exercise
    return exercise
  }

  // Brzycki formula
  async getExerciseWeight(groupExercise: GroupExercise, user: User) {
    const exercise = await this.getExercise(groupExercise)
    const { reference } = exercise
    if (!reference || !user) return null
    const params =
      reference === ExerciseReferences.DVC
        ? user.benchPresses
        : ExerciseReferences.DEADLIFT
          ? user.deadlifts
          : ExerciseReferences.ROWING
            ? user.rowings
            : user.squats
    const weight = brzycki(
      params.maxWeight,
      params.repetition,
      groupExercise.value
    )
    return weight
  }

  computeDifficulty(groupExercise: GroupExercise): number {
    const {
      format,
      exercise: { difficultyScale },
      value,
    } = groupExercise

    const goodScale = find(difficultyScale, { format })
    if (!goodScale) {
      // FIXME: Need to update the import file
      console.log('MISSING SCALE FOR:', groupExercise.id)
      return 0
      // throw new Error('no-scale-defined')
    }
    const difficulty = reduce(
      goodScale.difficultyScaleRules,
      (result, scale) => {
        if (value > scale.end || value < scale.start) return result
        result += (value / scale.step) * DIFFICULTY_STEP
        return result
      },
      goodScale.initialDifficulty
    )

    return difficulty
  }

  async createGroupExercise(
    groupExercisePayload: DeepPartial<GroupExercise>
  ): Promise<GroupExercise> {
    const groupExercise = this.groupExerciseRepository.create(
      groupExercisePayload as DeepPartial<GroupExercise>
    )
    return await this.groupExerciseRepository.save(groupExercise)
  }

  async updateGroupExercise(
    groupExercise: WhereUniqueInput,
    payload: DeepPartial<GroupExercise>
  ): Promise<GroupExercise> {
    await this.groupExerciseRepository.update(
      { uuid: groupExercise.uuid },
      { ...(payload as DeepPartial<GroupExercise>) }
    )
    const updatedGroupExercise = await this.groupExerciseRepository.findOneOrFail(
      {
        uuid: groupExercise.uuid,
      }
    )
    return updatedGroupExercise
  }

  deleteByUuid(uuid: string) {
    return this.groupExerciseRepository.delete({ uuid })
  }
}
