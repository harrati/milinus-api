import { InjectRepository } from '@nestjs/typeorm'
import { filter, orderBy, find } from 'lodash'
import { Repository, DeepPartial } from 'typeorm'
import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { UserTraining } from './userTraining.entity'
import { UserProgram } from '../userProgram/userProgram.entity'
import { Training } from '../training/training.entity'
import { Nullable } from '../../utils/types'
import { UserTrainingStatus, FeedbackData } from './userTraining.types'
import { Program } from '../program/program.entity'
import Aigle from 'aigle'
import { ONE_HUNDRED_PERCENT } from '../../utils/constants'
import { ReposService } from '../repos.service'

@Injectable()
export class UserTrainingService {
  constructor(
    @InjectRepository(UserTraining)
    public readonly userTrainingRepository: Repository<UserTraining>,
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService
  ) {}

  async create(
    userProgram: UserProgram,
    training: Training,
    status?: UserTrainingStatus
  ) {
    const userTraining = this.userTrainingRepository.create({
      training,
      userProgram,
      status,
    })
    const createdUserTraining = await this.userTrainingRepository.save(
      userTraining
    )
    return createdUserTraining
  }

  async loadTraining(userTraining: UserTraining) {
    const { training } = await this.userTrainingRepository.findOneOrFail(
      userTraining.id,
      { relations: ['training'] }
    )
    return training
  }

  async loadUserProgram(userTraining: UserTraining) {
    const { userProgram } = await this.userTrainingRepository.findOneOrFail(
      userTraining.id,
      { relations: ['userProgram'] }
    )
    return userProgram
  }

  findByUserProgramAndTraining(userProgram: UserProgram, training: Training) {
    return this.userTrainingRepository.findOne({ userProgram, training })
  }

  findByUuid(uuid: string) {
    return this.userTrainingRepository.findOne({ uuid })
  }

  loadUserTrainings(userProgram: UserProgram) {
    return this.userTrainingRepository
      .createQueryBuilder('training')
      .where('training."userProgramId" = :userProgramId', {
        userProgramId: userProgram.id,
      })
      .orderBy('id', 'ASC')
      .getMany()
  }

  async updateTrainings(
    userProgram: UserProgram,
    program: Program,
    payload: DeepPartial<UserTraining>
  ): Promise<{
    error: Nullable<string>
    isLast: Nullable<boolean>
    currentTraining: Nullable<UserTraining>
  }> {
    const userTrainings = await this.loadUserTrainings(userProgram)
    const currentIndex = userTrainings.findIndex(
      userTraining => userTraining.status === UserTrainingStatus.CURRENT
    )

    if (currentIndex === -1) {
      return {
        error: 'not-found',
        isLast: null,
        currentTraining: null,
      }
    }

    await this.userTrainingRepository.update(userTrainings[currentIndex].id, {
      ...payload,
      status: UserTrainingStatus.DONE,
    })
    const currentTraining = await this.userTrainingRepository.findOneOrFail(
      { id: userTrainings[currentIndex].id },
      { relations: ['training'] }
    )

    await this.repos.trainingReport.create(
      currentTraining,
      userProgram,
      currentIndex,
      payload.duration
    )

    if (currentIndex === userTrainings.length - 1) {
      return { isLast: true, error: null, currentTraining }
    }

    if (payload.feedback) {
      const newDifficulty = await this.getNearestDifficulty(
        userProgram,
        payload.feedback
      )

      if (!newDifficulty) {
        return {
          error: 'no-difficulty-found',
          isLast: null,
          currentTraining: null,
        }
      }

      this.repos.userProgram.updateTrainingGroup(userProgram, {
        id: newDifficulty.id,
      })

      const newTrainings = await this.repos.training.getTrainings(
        program,
        { trainingGroup: newDifficulty.id },
        'position'
      )
      const newUserTrainings = await this.updateDifficulty(
        userProgram,
        newTrainings,
        currentTraining.training.position
      )
      const nextTraining = find(newUserTrainings, {
        training: { position: currentTraining.training.position + 1 },
      })
      await this.userTrainingRepository.update(nextTraining.id, {
        status: UserTrainingStatus.CURRENT,
      })
      return {
        isLast: false,
        error: null,
        currentTraining: currentTraining,
      }
    }

    await this.userTrainingRepository.update(
      userTrainings[currentIndex + 1].id,
      {
        status: UserTrainingStatus.CURRENT,
      }
    )

    return {
      isLast: false,
      error: null,
      currentTraining: userTrainings[currentIndex],
    }
  }

  async updateDifficulty(
    userProgram: UserProgram,
    newTrainings: Training[],
    position: number
  ): Promise<UserTraining[]> {
    const createdUserTraining: UserTraining[] = []
    // DELETE PREVIOUS USER TRAININGS
    await this.userTrainingRepository
      .createQueryBuilder('ut')
      .leftJoinAndSelect('ut.training', 'training')
      .where('ut."userProgramId" = :id', { id: userProgram.id })
      .andWhere('training."position" > :position', { position })
      .getMany()
      .then(userTraining => {
        return this.userTrainingRepository.remove(userTraining)
      })
    const filteredTrainings = filter(newTrainings, e => e.position > position)
    await Aigle.each(filteredTrainings, async (n, i) => {
      const created = await this.create(
        userProgram,
        filteredTrainings[i],
        UserTrainingStatus.PENDING
      )
      createdUserTraining.push(created)
    })
    return createdUserTraining
  }

  getTrainingsCount(userProgram: UserProgram) {
    return this.userTrainingRepository
      .createQueryBuilder('training')
      .where('training."userProgramId" = :userProgramId', {
        userProgramId: userProgram.id,
      })
      .getCount()
  }

  async getCurrentTrainingIndex(userProgram: UserProgram) {
    const userTrainings = await this.loadUserTrainings(userProgram)
    const currentIndex = userTrainings.findIndex(
      userTraining => userTraining.status === UserTrainingStatus.CURRENT
    )
    return currentIndex !== -1 ? currentIndex : null
  }

  async getNearestDifficulty(userProgram: UserProgram, feedback: FeedbackData) {
    const allDifficulties = await this.repos.trainingGroup.getAllProgramDifficulties(
      userProgram.program
    )

    const orderedDifficulties = orderBy(allDifficulties, ['difficulty', 'asc'])
    const difficultyIndex = orderedDifficulties.findIndex(
      ({ id }) => id === userProgram.trainingGroup.id
    )

    return feedback === FeedbackData.DECREASE
      ? orderedDifficulties[difficultyIndex - 1]
        ? orderedDifficulties[difficultyIndex - 1]
        : orderedDifficulties[difficultyIndex]
      : orderedDifficulties[difficultyIndex + 1]
      ? orderedDifficulties[difficultyIndex + 1]
      : orderedDifficulties[difficultyIndex]
  }

  async calculateUserTrainingProgressPercentage(
    userProgram: UserProgram
  ): Promise<number> {
    const numberOfUserTrainings: number = await this.getTrainingsCount(
      userProgram
    )

    const currentIndexOfTrainings: number = await this.getCurrentTrainingIndex(
      userProgram
    )

    if (currentIndexOfTrainings === null) return ONE_HUNDRED_PERCENT

    return (
      (ONE_HUNDRED_PERCENT * currentIndexOfTrainings) / numberOfUserTrainings
    )
  }
}
