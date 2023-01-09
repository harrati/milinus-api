import { ReposService } from '../repos.service'
import { GroupExerciseLoader } from './groupExercise.loader'
import {
  Resolver,
  ResolveField,
  Parent,
  Int,
  Mutation,
  Args,
} from '@nestjs/graphql'
import { GroupExercise } from './groupExercise.entity'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { Exercise } from '../exercise/exercise.entity'
import { DeepPartial } from 'typeorm'
import {
  OrderTrainingGroupExercisesArgs,
  CreateTrainingGroupExerciseArgs,
  UpdateTrainingGroupExerciseArgs,
  DeleteTrainingGroupExerciseArgs,
} from './groupExercise.inputs'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { Group } from '../group/group.entity'

@UseGuards(AuthGuard)
@Resolver(() => GroupExercise)
export class GroupExerciseResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: GroupExerciseLoader
  ) {}

  @Mutation(() => Group)
  async createTrainingGroupExercise(
    @Args() args: CreateTrainingGroupExerciseArgs
  ): Promise<DeepPartial<GroupExercise>> {
    const {
      where: { groupUuid },
      data: { exerciseUuid, format, position, value },
    } = args
    const group = await this.repos.group.findByUuid(groupUuid)
    const exercise = await this.repos.exercise.findByUuid(exerciseUuid)
    const payload = {
      group,
      exercise,
      format,
      position,
      value,
    }
    await this.repos.groupExercise.reorderGroupExercises(group, position, true)
    await this.repos.groupExercise.createGroupExercise(payload)
    return await this.repos.group.findByUuid(groupUuid)
  }

  @Mutation(() => GroupExercise)
  updateTrainingGroupExercise(
    @Args() args: UpdateTrainingGroupExerciseArgs
  ): Promise<DeepPartial<GroupExercise>> {
    const { data, where } = args
    return this.repos.groupExercise.updateGroupExercise(where, data)
  }

  @Mutation(() => Group)
  async deleteTrainingGroupExercise(
    @Args() args: DeleteTrainingGroupExerciseArgs
  ): Promise<DeepPartial<Group>> {
    const { group, position } = await this.repos.groupExercise.findByUuid(
      args.uuid
    )
    await this.repos.groupExercise.reorderGroupExercises(group, position, false)
    await this.repos.groupExercise.deleteByUuid(args.uuid)
    return await this.repos.group.findByUuid(group.uuid)
  }

  @Mutation(() => GroupExercise)
  orderTrainingGroupExercises(
    @Args() args: OrderTrainingGroupExercisesArgs
  ): Promise<DeepPartial<GroupExercise>> {
    const { data, where } = args
    return this.repos.groupExercise.updateGroupExercise(where, data)
  }

  @ResolveField('exercise', () => Exercise)
  exercise(
    @Parent() groupExercice: GroupExercise
  ): Promise<DeepPartial<Exercise>> {
    return this.loader.exercise().load(groupExercice)
  }

  @ResolveField('weight', () => Int)
  async weight(
    @Parent() groupExercise: GroupExercise,
    @CurrentUser() user: User
  ): Promise<number> {
    const weight = await this.loader.weight().load({ user, groupExercise })
    return weight || 0 //FIXME: investigate why weight can be null sometimes
  }
}
