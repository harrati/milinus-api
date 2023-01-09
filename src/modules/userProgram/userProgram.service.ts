import Aigle from 'aigle'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserProgram } from './userProgram.entity'
import { Repository, DeepPartial } from 'typeorm'
import { User } from '../user/user.entity'
import { Program } from '../program/program.entity'
import { ProgramService } from '../program/program.service'
import { UserTrainingService } from '../userTraining/userTraining.service'
import { UserProgramScheduleMapper } from '../../utils/enumMapper'
import { PROGRAM_MAX_WEEKS_DURATION } from '../../utils/constants'
import { UserTrainingStatus } from '../userTraining/userTraining.types'
import { TrainingGroupService } from '../trainingGroup/trainingGroup.service'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'

@Injectable()
export class UserProgramService {
  constructor(
    @InjectRepository(UserProgram)
    public readonly userProgramRepository: Repository<UserProgram>,
    public readonly userTrainingService: UserTrainingService,
    public readonly programService: ProgramService,
    public readonly trainingGroupService: TrainingGroupService
  ) {}

  async getCurrent(user: User) {
    return await this.userProgramRepository
      .createQueryBuilder('prog')
      .leftJoinAndSelect('prog.program', 'program')
      .leftJoinAndSelect('prog.trainingGroup', 'trainingGroup')
      .leftJoinAndSelect('prog.user', 'user')
      .where('prog."userId" = :userId', { userId: user.id })
      .andWhere('prog."completedAt" IS NULL')
      .andWhere('prog."stoppedAt" IS NULL')
      .getOne()
  }

  async getStoppedProgram(user: User, program: Program) {
    return await this.userProgramRepository
      .createQueryBuilder('prog')
      .where('prog."userId" = :userId', { userId: user.id })
      .andWhere('prog."programId" = :programId', { programId: program.id })
      .andWhere('prog."completedAt" IS NULL')
      .andWhere('prog."stoppedAt" IS NOT NULL')
      .getOne()
  }

  async create(user: User, program: Program) {
    const trainingGroup = await this.trainingGroupService.loadDefaultTrainingGroup(
      program
    )
    const userProgram = this.userProgramRepository.create({
      user,
      program,
      trainingGroup,
    })
    const created = await this.userProgramRepository.save(userProgram)

    const userTrainingPerWeek = UserProgramScheduleMapper[user.programSchedule]
    const maxTrainings = userTrainingPerWeek * PROGRAM_MAX_WEEKS_DURATION

    const numberOfUserTrainings = Math.min(
      trainingGroup.trainings.length,
      maxTrainings
    )

    await Aigle.timesSeries(numberOfUserTrainings, async n => {
      await this.userTrainingService.create(
        created,
        trainingGroup.trainings[n],
        n === 0 ? UserTrainingStatus.CURRENT : UserTrainingStatus.PENDING
      )
    })

    return created
  }

  async loadProgram(userProgram: UserProgram) {
    const { program } = await this.userProgramRepository.findOneOrFail(
      userProgram.id,
      { relations: ['program'] }
    )
    return program
  }

  async loadUser(userProgram: UserProgram) {
    const { user } = await this.userProgramRepository.findOneOrFail(
      userProgram.id,
      { relations: ['user'] }
    )
    return user
  }

  async loadUserTrainings(userProgram: UserProgram) {
    const { userTrainings } = await this.userProgramRepository.findOneOrFail(
      userProgram.id,
      {
        relations: ['userTrainings'],
      }
    )
    return userTrainings
  }

  async loadUserEvaluations(userProgram: UserProgram) {
    const { userEvaluations } = await this.userProgramRepository.findOneOrFail(
      userProgram.id,
      {
        relations: ['userEvaluations'],
      }
    )
    return userEvaluations
  }

  async stopProgram(userProgram: UserProgram) {
    userProgram.stoppedAt = new Date()
    const savedProgram = await this.userProgramRepository.save(userProgram)
    return savedProgram
  }

  async resumeProgram(userProgram: UserProgram) {
    userProgram.stoppedAt = null
    const savedProgram = await this.userProgramRepository.save(userProgram)
    return savedProgram
  }

  async finishProgram(userProgram: UserProgram) {
    userProgram.completedAt = new Date()
    const savedProgram = await this.userProgramRepository.save(userProgram)
    return savedProgram
  }

  async getEvaluationsSchedule(userProgram: UserProgram) {
    const trainingCount = await this.userTrainingService.getTrainingsCount(
      userProgram
    )

    const middle =
      trainingCount % 2 === 0 ? trainingCount / 2 : (trainingCount + 1) / 2

    const evaluationSchedule = [1, middle, trainingCount]
    return evaluationSchedule
  }

  async isEvaluationDue(userProgram: UserProgram) {
    const userEvaluations = await this.loadUserEvaluations(userProgram)
    const userEvaluationsCount = userEvaluations.length
    const schedule = await this.getEvaluationsSchedule(userProgram)
    const currentIndex = await this.userTrainingService.getCurrentTrainingIndex(
      userProgram
    )

    const isDue = schedule.reduce((accumulator, evalutionIndex, index) => {
      return (
        accumulator ||
        (currentIndex === evalutionIndex - 1 &&
          userEvaluationsCount < index + 1)
      )
    }, false)

    return isDue
  }

  async updateTrainingGroup(
    userProgram: UserProgram,
    trainingGroup: DeepPartial<TrainingGroup>
  ) {
    return await this.userProgramRepository.update(userProgram.id, {
      trainingGroup,
    })
  }
}
