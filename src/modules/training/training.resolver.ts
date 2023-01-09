import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Args,
  Mutation,
  Float,
} from '@nestjs/graphql'
import { ReposService } from './../repos.service'
import { Training } from './training.entity'
import { TrainingLoader } from './training.loader'
import {
  TrainingArgs,
  TrainingsArgs,
  CreateTrainingArgs,
  UpdateTrainingArgs,
} from './training.inputs'
import { DeepPartial } from 'typeorm'
import { Group } from '../group/group.entity'
import { BodyAreas, TrainingEquipments } from '../profile/profile.types'
import { WhereUniqueArgs } from '../../utils/types'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { Program } from '../program/program.entity'

@UseGuards(AuthGuard)
@Resolver(() => Training)
export class TrainingResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: TrainingLoader
  ) {}

  @Query(() => Training)
  training(@Args() args: WhereUniqueArgs): Promise<DeepPartial<Training>> {
    return this.repos.training.findByUuid(args.uuid)
  }

  @Query(() => [Training])
  async trainings(
    @Args() args: TrainingsArgs
  ): Promise<Array<DeepPartial<Training>>> {
    const { programUuid, filters, order } = args
    const program = await this.repos.program.findByUuid(programUuid)
    return this.repos.training.getTrainings(program, filters, order)
  }

  @Mutation(() => Training)
  async createTraining(
    @Args() args: CreateTrainingArgs
  ): Promise<DeepPartial<Training>> {
    const {
      data,
      where: { programUuid, trainingGroupUuid },
    } = args
    const program = await this.repos.program.findByUuid(programUuid)
    const trainingGroup = await this.repos.trainingGroup.findByUuid(
      trainingGroupUuid
    )
    data.program = program
    data.trainingGroup = trainingGroup
    return this.repos.training.createTraining(data)
  }

  @Mutation(() => Training)
  updateTraining(
    @Args() args: UpdateTrainingArgs
  ): Promise<DeepPartial<Training>> {
    const { data, where } = args
    return this.repos.training.updateTraining(where, data)
  }

  @Mutation(() => Boolean)
  async deleteTraining(@Args() args: TrainingArgs): Promise<boolean> {
    await this.repos.training.deleteByUuid(args.uuid)
    return true
  }

  @ResolveField('groups', () => [Group], { nullable: true })
  groups(@Parent() training: Training): Promise<DeepPartial<Group>[]> {
    return this.loader.groups().load(training)
  }

  @ResolveField('bodyAreas', () => [BodyAreas], { nullable: true })
  bodyAreas(@Parent() training: Training): Promise<BodyAreas[]> {
    return this.loader.bodyAreas().load(training)
  }

  @ResolveField('difficulty', () => Float, { nullable: true })
  difficulty(@Parent() training: Training): Promise<number> {
    return this.loader.difficulty().load(training)
  }

  @ResolveField('equipments', () => [TrainingEquipments], { nullable: true })
  equipments(@Parent() training: Training): Promise<TrainingEquipments[]> {
    return this.loader.equipments().load(training)
  }

  @ResolveField('program', () => Program)
  program(@Parent() training: Training): Promise<DeepPartial<Program>> {
    return this.loader.program().load(training)
  }

  @ResolveField('duration', () => Number)
  duration(@Parent() training: Training): Promise<number> {
    return this.loader.duration().load(training)
  }
}
