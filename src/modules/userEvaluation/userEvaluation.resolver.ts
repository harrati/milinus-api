import { UseGuards } from '@nestjs/common'
import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { AuthGuard } from '../../guards'
import { UserEvaluation } from './userEvaluation.entity'
import { ReposService } from '../repos.service'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { CompleteEvaluationArgs } from './userEvaluation.inputs'
import { DeepPartial } from 'typeorm'

@UseGuards(AuthGuard)
@Resolver(() => UserEvaluation)
export class UserEvaluationResolver {
  constructor(private readonly repos: ReposService) {}

  @Mutation(() => UserEvaluation)
  async completeEvaluation(
    @Args() args: CompleteEvaluationArgs,
    @CurrentUser() user: User
  ): Promise<DeepPartial<UserEvaluation>> {
    const currentProgram = await this.repos.userProgram.getCurrent(user)
    if (!currentProgram) throw new Error('CURRENT_PROGRAM_NOT_FOUND')

    const isEvaluationDue = await this.repos.userProgram.isEvaluationDue(
      currentProgram
    )

    if (!isEvaluationDue) throw new Error('NO_EVALUATIONS_DUE')

    const evaluation = await this.repos.userEvaluation.create({
      result: args.result,
      userProgram: currentProgram,
    })
    return evaluation
  }
}
