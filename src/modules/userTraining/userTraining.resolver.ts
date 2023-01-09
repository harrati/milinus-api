import {
  Resolver,
  ResolveField,
  Parent,
  Mutation,
  Args,
  Query,
} from '@nestjs/graphql'
import { find } from 'lodash'
import { UseGuards } from '@nestjs/common'
import { ProtectedParamsGuard, AuthGuard } from '../../guards'
import { UserTraining } from './userTraining.entity'
import { ReposService } from '../repos.service'
import { UserTrainingLoader } from './userTraining.loader'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { CompleteCurrentTrainingArgs } from './userTraining.inputs'
import { DeepPartial } from 'typeorm'
import { Training } from '../training/training.entity'
import { TrainingReport } from '../trainingReport/trainingReport.entity'
import { TrainingActions } from './userTraining.types'
import { Running } from '../running/running.entity'

@UseGuards(ProtectedParamsGuard, AuthGuard)
@Resolver(() => UserTraining)
export class UserTrainingResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: UserTrainingLoader
  ) {}

  @Query(() => UserTraining)
  userTraining(
    @Args('userTrainingUuid') userTrainingUuid: string
  ): Promise<UserTraining> {
    return this.repos.userTraining.findByUuid(userTrainingUuid)
  }

  @Query(() => TrainingActions)
  async trainingActions(@CurrentUser() user: User): Promise<TrainingActions> {
    const userProgram = await this.repos.userProgram.getCurrent(user)
    if (!userProgram) throw new Error('not-found')

    const allDifficulties = await this.repos.trainingGroup.getAllProgramDifficulties(
      userProgram.program
    )

    const current = find(allDifficulties, {
      id: userProgram.trainingGroup.id,
    })

    return {
      increase: !!find(
        allDifficulties,
        ({ difficulty }) => difficulty > current.difficulty
      ),
      decrease: !!find(
        allDifficulties,
        ({ difficulty }) => difficulty < current.difficulty
      ),
    }
  }

  @Mutation(() => UserTraining)
  async completeCurrentTraining(
    @CurrentUser() user: User,
    @Args() args: CompleteCurrentTrainingArgs
  ): Promise<DeepPartial<UserTraining>> {
    try {
      const { duration, feedback, finisher } = args
      const currentProgram = await this.repos.userProgram.getCurrent(user)
      if (!currentProgram) throw new Error('not-found')

      const program = await this.repos.userProgram.loadProgram(currentProgram)
      const isEvaluationDue = await this.repos.userProgram.isEvaluationDue(
        currentProgram
      )

      if (isEvaluationDue) throw new Error('EVALUATION_IS_DUE')

      const {
        error,
        isLast,
        currentTraining,
      } = await this.repos.userTraining.updateTrainings(
        currentProgram,
        program,
        {
          duration,
          feedback,
          finisher,
        }
      )

      if (error || !currentTraining) throw new Error(error || 'error')

      const progressPercentage = await this.repos.userTraining.calculateUserTrainingProgressPercentage(
        currentProgram
      )

      if (progressPercentage > 50) {
        this.repos.notification.sendHalfProgramNotificationToUser(user)
      }
      const planet = await this.repos.system.findPlanetInSystemToUnlock(
        currentProgram,
        progressPercentage
      )

      if (planet) {
        this.repos.notification.sendPlanetNotificationToUser(user)
      }

      this.repos.planet.createUserPlanet(user, planet)

      if (!isLast) return currentTraining
      await this.repos.userProgram.finishProgram(currentProgram)
      return currentTraining
    } catch (error) {
      console.log('error: ', error)
    }
  }

  @ResolveField('training', () => Training)
  training(
    @Parent() userTraining: UserTraining
  ): Promise<DeepPartial<Training>> {
    return this.loader.training().load(userTraining)
  }

  @ResolveField('report', () => TrainingReport, { nullable: true })
  report(
    @Parent() userTraining: UserTraining
  ): Promise<DeepPartial<TrainingReport>> {
    return this.loader.report().load(userTraining)
  }

  @ResolveField('runnings', () => [Running], { nullable: true })
  async runnings(
    @Parent() userTraining: UserTraining
  ): Promise<DeepPartial<Running[]>> {
    return await this.loader.runnings().load(userTraining)
  }
}
