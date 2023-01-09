import {
  Query,
  Args,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { Evaluation } from './evaluation.entity'
import { DeepPartial } from 'typeorm'
import { Exercise } from '../exercise/exercise.entity'
import { EvaluationLoader } from './evaluation.loader'
import {
  CreateEvaluationArgs,
  UpdateEvaluationArgs,
  EvaluationWhereInput,
} from './evaluation.inputs'
import { Program } from '../program/program.entity'

@UseGuards(AuthGuard)
@Resolver(() => Evaluation)
export class EvaluationResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: EvaluationLoader
  ) {}

  @Query(() => Evaluation)
  async evaluationForProgram(
    @Args() args: EvaluationWhereInput
  ): Promise<DeepPartial<Evaluation>> {
    const program: Program = await this.repos.program.findByUuid(
      args.programUuid
    )
    return await this.repos.evaluation.findByProgram(program)
  }

  @Mutation(() => Evaluation)
  async createEvaluation(
    @Args() args: CreateEvaluationArgs
  ): Promise<DeepPartial<Evaluation>> {
    const params: DeepPartial<Evaluation> = {
      duration: args.duration,
      program: await this.repos.program.findByUuid(args.programUuid),
      exercise: await this.repos.exercise.findByUuid(args.exerciseUuid),
    }
    return await this.repos.evaluation.createEvaluation(params)
  }

  @Mutation(() => Evaluation)
  async updateEvaluation(@Args() args: UpdateEvaluationArgs) {
    const { where, data } = args
    const params: DeepPartial<Evaluation> = {}
    if (data.exerciseUuid) {
      params.exercise = await this.repos.exercise.findByUuid(data.exerciseUuid)
    }
    if (data.duration) {
      params.duration = data.duration
    }
    return await this.repos.evaluation.updateEvaluation(where, params)
  }

  @ResolveField('exercise', () => Exercise)
  async exercise(
    @Parent() evaluation: Evaluation
  ): Promise<DeepPartial<Exercise>> {
    return await this.loader.loadExerciseForEvaluation().load(evaluation)
  }
}
