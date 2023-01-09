import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { System } from './system.entity'
import { SystemConnection, UserSystemsArgs } from './system.types'
import { SystemsArgs } from './system.inputs'
import { User } from '../user/user.entity'
import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { UseGuards } from '@nestjs/common'
import { CurrentUser } from '../../decorators'
import { Planet } from '../planet/planet.entity'
import { PlanetLoader } from '../planet/planet.loader'
import { SystemLoader } from './system.loader'

@UseGuards(AuthGuard)
@Resolver(() => System)
export class SystemResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: PlanetLoader,
    private readonly systemLoader: SystemLoader
  ) {}
  @Query(() => SystemConnection)
  systems(@Args() args: SystemsArgs): Promise<SystemConnection> {
    const { after, first, sort } = args
    return this.repos.system.getSystems(first, after, sort)
  }

  @Query(() => [System])
  async userSystems(
    @CurrentUser() currentUser: User,
    @Args() args: UserSystemsArgs
  ): Promise<System[]> {
    const user = args.where
      ? await this.repos.user.findByUuid(args.where.userUuid)
      : currentUser
    if (!user) throw new Error('user-not-found')

    return this.repos.system.getUserSystems(user)
  }

  @Mutation(() => User)
  completeSystemTutorial(@CurrentUser() user: User): Promise<User> {
    const payload = {
      hasCompletedSystemTutorial: true,
    }
    return this.repos.user.updateAndFetch(user, payload)
  }

  @ResolveField('planets', () => [Planet])
  async planets(@Parent() system: System): Promise<Planet[]> {
    return this.loader.planets().load(system)
  }

  @ResolveField('uses', () => Number)
  async uses(@Parent() system: System): Promise<number> {
    return this.systemLoader.countUsage().load(system)
  }

  @ResolveField('name', () => Number)
  async name(@Parent() system: System): Promise<string> {
    return this.systemLoader.systemName().load(system)
  }
}
