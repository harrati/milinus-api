import { UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Args,
  Mutation,
  Parent,
  ResolveField,
  Int,
} from '@nestjs/graphql'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { ProtectedParamsGuard, AuthGuard } from '../../guards'
import { ReposService } from '../repos.service'
import { UserProgramLoader } from './userProgram.loader'
import { UserProgram } from './userProgram.entity'
import { DeepPartial } from 'typeorm'
import { UserProgramArgs } from './userProgram.inputs'
import { Program } from '../program/program.entity'
import { UserTraining } from '../userTraining/userTraining.entity'
import { Nullable } from '../../utils/types'
import { UserEvaluation } from '../userEvaluation/userEvaluation.entity'

@UseGuards(ProtectedParamsGuard, AuthGuard)
@Resolver(() => UserProgram)
export class UserProgramResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: UserProgramLoader
  ) {}

  @Query(() => UserProgram, { nullable: true })
  async currentProgram(
    @CurrentUser() user: User
  ): Promise<DeepPartial<UserProgram>> {
    const program = await this.repos.userProgram.getCurrent(user)
    if (!program) return null
    return program
  }

  @Query(() => Boolean)
  async isProgramStopped(
    @CurrentUser() user: User,
    @Args('uuid') uuid: string
  ) {
    const program = await this.repos.program.findByUuid(uuid)
    if (!program) throw new Error('not-found')

    const stoppedProgram = await this.repos.userProgram.getStoppedProgram(
      user,
      program
    )
    return !!stoppedProgram
  }

  @Mutation(() => UserProgram)
  async startProgram(
    @CurrentUser() user: User,
    @Args() args: UserProgramArgs
  ): Promise<DeepPartial<UserProgram>> {
    const currentProgram = await this.repos.userProgram.getCurrent(user)
    if (currentProgram) throw new Error('ALREADY_HAS_PROGRAM_STARTED')

    const program = await this.repos.program.findByUuid(args.uuid)
    if (!program) throw new Error('not-found')

    const oldProgram = await this.repos.userProgram.getStoppedProgram(
      user,
      program
    )
    if (oldProgram) {
      return await this.repos.userProgram.resumeProgram(oldProgram)
    }

    const userProgram = await this.repos.userProgram.create(user, program)
    return userProgram
  }

  @Mutation(() => Boolean)
  async stopProgram(@CurrentUser() user: User): Promise<boolean> {
    const currentProgram = await this.repos.userProgram.getCurrent(user)
    if (!currentProgram) throw new Error('not-found')

    await this.repos.userProgram.stopProgram(currentProgram)
    return true
  }

  @ResolveField('program', () => Program)
  program(@Parent() userProgram: UserProgram): Promise<DeepPartial<Program>> {
    return this.loader.program().load(userProgram)
  }

  @ResolveField('userTrainings', () => [[UserTraining]])
  userTrainings(
    @Parent() userProgram: UserProgram
  ): Promise<DeepPartial<UserTraining[][]>> {
    return this.loader.userTrainings().load(userProgram)
  }
  @ResolveField('isEvaluationDue', () => Boolean)
  isEvaluationDue(@Parent() userProgram: UserProgram): Promise<boolean> {
    return this.loader.isEvaluationDue().load(userProgram)
  }
  @ResolveField('currentTrainingIndex', () => Int, { nullable: true })
  currentTrainingIndex(
    @Parent() userProgram: UserProgram
  ): Promise<Nullable<number>> {
    return this.loader.currentTrainingIndex().load(userProgram)
  }
  @ResolveField('evaluationSchedule', () => [Int])
  evaluationSchedule(@Parent() userProgram: UserProgram): Promise<number[]> {
    return this.loader.evaluationSchedule().load(userProgram)
  }
  @ResolveField('userEvaluations', () => [UserEvaluation])
  userEvaluations(
    @Parent() userProgram: UserProgram
  ): Promise<DeepPartial<UserEvaluation>[]> {
    return this.loader.userEvaluations().load(userProgram)
  }
}
