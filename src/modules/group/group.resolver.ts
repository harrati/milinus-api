import { Resolver, ResolveField, Parent, Mutation, Args } from '@nestjs/graphql'
import { ReposService } from '../repos.service'
import { GroupLoader } from './group.loader'
import { Group } from './group.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { DeepPartial } from 'typeorm'
import {
  CreateTrainingGroupArgs,
  UpdateTrainingGroupArgs,
  DeleteTrainingGroupArgs,
  OrderTrainingGroupArgs,
  DuplicateGroupArgs,
} from './group.inputs'
import { Training } from '../training/training.entity'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'

@Resolver(() => Group)
@UseGuards(AuthGuard)
export class GroupResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: GroupLoader
  ) { }

  @Mutation(() => Group)
  async createGroup(
    @Args() args: CreateTrainingGroupArgs
  ): Promise<DeepPartial<Group>> {
    const {
      data,
      where: { trainingUuid },
    } = args
    data.training = await this.repos.training.findByUuid(trainingUuid)
    return this.repos.group.createGroup(data)
  }

  @Mutation(() => Group)
  updateGroup(
    @Args() args: UpdateTrainingGroupArgs
  ): Promise<DeepPartial<Group>> {
    const { data, where } = args
    return this.repos.group.updateGroup(where, data)
  }
  @Mutation(() => Group)
  async duplicateGroup(
    @Args() args: DuplicateGroupArgs
  ): Promise<DeepPartial<Group>> {
    const sourceGroup = await this.repos.group.findByUuid(args.uuid)
    const targetGroup = await this.repos.group.copyGroup(sourceGroup)
    const sourceExercises = await this.repos.groupExercise.getGroupExercises(sourceGroup)
    for (const [i, v] of sourceExercises.entries()) {
      v.position = i
      await this.repos.groupExercise.copyGroupExercise(v, targetGroup)
    }
    return targetGroup
  }

  @Mutation(() => Training)
  async deleteGroup(
    @Args() args: DeleteTrainingGroupArgs
  ): Promise<DeepPartial<Training>> {
    const { training, position } = await this.repos.group.findByUuid(args.uuid)
    await this.repos.group.reorderGroup(training, position, false)
    await this.repos.group.deleteByUuid(args.uuid)
    return this.repos.training.findByUuid(training.uuid)
  }

  @Mutation(() => Group)
  orderGroup(
    @Args() args: OrderTrainingGroupArgs
  ): Promise<DeepPartial<Group>> {
    const { data, where } = args
    return this.repos.group.updateGroup(where, data)
  }

  @ResolveField('groupExercises', () => [GroupExercise])
  groupExercises(
    @Parent() group: Group
  ): Promise<DeepPartial<GroupExercise[]>> {
    return this.loader.groupExercices().load(group)
  }

  @ResolveField('nameEn', () => String)
  nameEn(@Parent() group: Group): string {
    return 'Group ' + (group.position + 1)
  }
}
