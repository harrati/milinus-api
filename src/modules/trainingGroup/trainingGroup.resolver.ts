// eslint-disable-next-line prettier/prettier
import { Resolver, Args, Query, ResolveField, Parent, Mutation } from '@nestjs/graphql'
import { ReposService } from './../repos.service'
import { TrainingGroup } from './trainingGroup.entity'
import { WhereUniqueArgs } from '../../utils/types'
import { TrainingGroupLoader } from './trainingGroup.loader'
import {
  CreateTrainingGroupArgs,
  TrainingGroupUpdateArgs,
} from '../trainingGroup/trainingGroup.inputs'
import { DeepPartial } from 'typeorm'
import { Training } from '../training/training.entity'

@Resolver(() => TrainingGroup)
export class TrainingGroupResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: TrainingGroupLoader
  ) {}

  @Query(() => TrainingGroup)
  async trainingGroup(
    @Args() args: WhereUniqueArgs
  ): Promise<DeepPartial<TrainingGroup>> {
    return await this.repos.trainingGroup.findByUuid(args.uuid)
  }

  @Query(() => [TrainingGroup])
  async trainingGroups(
    @Args() args: WhereUniqueArgs
  ): Promise<Array<DeepPartial<TrainingGroup>>> {
    return await this.repos.trainingGroup.findByProgramUuid(args.uuid)
  }

  @Mutation(() => Boolean)
  async deleteTrainingGroup(@Args() args: WhereUniqueArgs): Promise<boolean> {
    await this.repos.trainingGroup.deleteByUuid(args.uuid)
    return true
  }

  @Mutation(() => TrainingGroup)
  async duplicateTrainingGroup(
    @Args() args: WhereUniqueArgs
  ): Promise<TrainingGroup> {
    return await this.repos.trainingGroup.createDuplicate(args.uuid)
  }

  @Mutation(() => TrainingGroup)
  async createTrainingGroup(
    @Args() args: CreateTrainingGroupArgs
  ): Promise<DeepPartial<TrainingGroup>> {
    const { where, data } = args
    const payload = {
      program: await this.repos.program.findByUuid(where.programUuid),
      default: data.default,
    }
    return await this.repos.trainingGroup.create(payload)
  }

  @Mutation(() => TrainingGroup)
  async updateTrainingGroup(
    @Args() args: TrainingGroupUpdateArgs
  ): Promise<DeepPartial<TrainingGroup>> {
    const { where, data } = args
    const { program } = await this.repos.trainingGroup.findByUuid(where.uuid)
    const currentReferenceGroup = await this.repos.trainingGroup.getReferenceGroupForProgram(
      program.uuid
    )
    if (currentReferenceGroup) {
      await this.repos.trainingGroup.update(
        { uuid: currentReferenceGroup.uuid },
        { default: false }
      )
    }
    return await this.repos.trainingGroup.update(where, data)
  }

  @ResolveField('difficulty', () => Number)
  async difficulty(@Parent() trainingGroup: TrainingGroup): Promise<number> {
    return this.loader.difficulty().load(trainingGroup)
  }

  @ResolveField('trainings', () => [Training])
  async trainings(
    @Parent() trainingGroup: TrainingGroup
  ): Promise<DeepPartial<Training[]>> {
    return this.loader.trainings().load(trainingGroup)
  }
}
