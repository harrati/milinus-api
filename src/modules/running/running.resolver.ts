import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { Running } from './running.entity'
import { RunningConnection } from './running.types'
import { RunningsArgs, RunningArgs, CreateRunningArgs } from './running.inputs'
import { DeepPartial } from 'typeorm'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'

@UseGuards(AuthGuard)
@Resolver(() => Running)
export class RunningResolver {
  constructor(private readonly repos: ReposService) {}
  @Query(() => RunningConnection, { description: 'Not implemented' })
  runnings(
    @Args() args: RunningsArgs
  ): Promise<DeepPartial<RunningConnection>> {
    console.log(args)
    return null
  }

  @Query(() => Running, { description: 'Not implemented' })
  running(@Args() args: RunningArgs): Promise<DeepPartial<Running>> {
    console.log(args)
    return null
  }

  @Mutation(() => Running)
  async createRunning(
    @CurrentUser() user: User,
    @Args() args: CreateRunningArgs
  ): Promise<DeepPartial<Running>> {
    const currentProgram = await this.repos.userProgram.getCurrent(user)
    const training = await this.repos.training.findByUuid(
      args.where.trainingUuid
    )
    const userTraining = await this.repos.userTraining.findByUserProgramAndTraining(
      currentProgram,
      training
    )
    const payload = {
      ...args.data,
      user,
      userTraining,
    }

    return this.repos.running.createRunning(payload)
  }
}
