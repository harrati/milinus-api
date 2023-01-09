import { Evolution } from './evolution.entity'
import {
  Query,
  Args,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
  Float,
} from '@nestjs/graphql'
import { EvolutionConnection } from './evolution.types'
import {
  EvolutionsArgs,
  CreateEvolutionArgs,
  EvolutionsDataArgs,
} from './evolution.inputs'
import { UseInterceptors, UseGuards } from '@nestjs/common'
import { GraphqlFileFieldsInterceptor } from '../../interceptors/graphql-file-fields.interceptor'
import { ReposService } from '../repos.service'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { AuthGuard } from '../../guards'
import { WhereUniqueArgs } from '../../utils/types'

@UseGuards(AuthGuard)
@Resolver(() => Evolution)
export class EvolutionResolver {
  constructor(private readonly repos: ReposService) {}

  @Query(() => EvolutionConnection)
  evolutions(
    @CurrentUser() user: User,
    @Args() args: EvolutionsArgs
  ): Promise<EvolutionConnection> {
    const { where, after, first } = args
    return this.repos.evolution.getEvolutionsForUser(where, user, first, after)
  }

  @Query(() => [Float])
  evolutionsData(
    @CurrentUser() user: User,
    @Args() args: EvolutionsDataArgs
  ): Promise<number[]> {
    const { where } = args
    return this.repos.evolution.getEvolutionsData(where, user)
  }

  @Query(() => Evolution)
  evolution(@Args() args: WhereUniqueArgs): Promise<Evolution> {
    const { uuid } = args
    return this.repos.evolution.getEvolutionsByUuid(uuid)
  }

  @Mutation(() => Evolution)
  @UseInterceptors(GraphqlFileFieldsInterceptor)
  async createEvolution(
    @CurrentUser() user: User,
    @Args() args: CreateEvolutionArgs
  ): Promise<Evolution> {
    args.user = user
    return this.repos.evolution.createEvolution(args)
  }

  @ResolveField('watermarkedPictureUrl', () => String)
  async watermarkedPictureUrl(@Parent() evolution: Evolution): Promise<string> {
    return await this.repos.evolution.getWatermarkPictureUrlForEvolution(
      evolution
    )
  }
}
