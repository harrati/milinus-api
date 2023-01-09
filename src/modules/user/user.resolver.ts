import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { User } from './user.entity'
import {
  ProfilesArgs,
  ProfilesUserNameArgs,
  UserArgs,
  ContactArgs,
  StatusSubscriptionArgs,
  StatusSubscriptionPreniumArgs,
} from './user.inputs'
import {
  UserConnection,
  ChartWeightBoundaries,
  UserStatus,
  UserSubscriptionStatus,
  UserSubscriptionPeriod,
} from './user.types'
import { UserLoader } from './user.loader'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard, RolesGuard } from '../../guards'
import { System } from '../system/system.entity'
import { DeepPartial } from 'typeorm'
import { CurrentUser } from '../../decorators'
import { LibsService } from '../../libs/libs.service'
import { ObjectLiteral } from 'typeorm'
import { ContactSubjectMapper } from '../../utils/constants'
import { Roles } from '../../decorators/role.decorator'
import { Program } from '../program/program.entity'

@UseGuards(AuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly loader: UserLoader,
    private readonly repos: ReposService,
    private readonly libsService: LibsService
  ) {}

  @Query(() => UserConnection)
  profiles(@Args() args: ProfilesArgs): Promise<UserConnection> {
    const {
      where: { search },
      after,
      first,
    } = args
    return this.repos.user.getUsers(search, first, after)
  }

  @Query(() => UserConnection)
  profilesUserName(@Args() args: ProfilesArgs): Promise<UserConnection> {
    const {
      where: { search },
      after,
      first,
    } = args
    return this.repos.user.findAllByUserName(search, first, after)
  }

  @Query(() => User)
  user(@Args() args: UserArgs): Promise<User> {
    return this.repos.user.findByUuid(args.uuid)
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async contact(
    @Args() args: ContactArgs,
    @CurrentUser() me: User
  ): Promise<boolean> {
    const payload: ObjectLiteral = {
      subject: ContactSubjectMapper[args.data.subject],
      userMessage: args.data.content,
      userFirstName: me.firstName,
      userLastName: me.lastName,
      userMail: me.email,
    }

    this.libsService.mailjet.sendContactMail('contact', payload)
    return true
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Mutation(() => User)
  async banUser(@Args() args: UserArgs): Promise<User> {
    const user = await this.repos.user.findByUuid(args.uuid)
    return this.repos.user.updateUserStatus(user, UserStatus.BANNED)
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Mutation(() => User)
  async unBanUser(@Args() args: UserArgs): Promise<User> {
    const user = await this.repos.user.findByUuid(args.uuid)
    return this.repos.user.updateUserStatus(user, UserStatus.ACTIVE)
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async UserSubscribeFree(@Args() args: StatusSubscriptionArgs): Promise<User> {
    const user = await this.repos.user.findByUuid(args.uuid)
    return this.repos.user.updateUserStatusSubscription(
      user,
      UserSubscriptionStatus.FREE,
      UserSubscriptionPeriod.PERIOD_1
    )
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async UserSubscribePremium(
    @Args() args: StatusSubscriptionPreniumArgs
  ): Promise<User> {
    const user = await this.repos.user.findByUuid(args.uuid)

    return this.repos.user.updateUserStatusSubscription(
      user,
      UserSubscriptionStatus.PREMIUM,
      args.period
    )
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Mutation(() => Boolean, { description: 'Not implemented, admin route' })
  deleteUser(@Args() args: UserArgs): Promise<boolean> {
    console.log(args)
    return null
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { description: 'User side action' })
  deleteAccount(@CurrentUser() user: User): Promise<DeepPartial<boolean>> {
    return this.repos.user.delete(user)
  }

  @ResolveField('chartWeightBoundaries', () => ChartWeightBoundaries)
  chartWeightBoundaries(@Parent() user: User): Promise<ChartWeightBoundaries> {
    return this.loader.chartWeightBoundaries().load(user)
  }

  @ResolveField('system', () => System)
  system(@Parent() user: User): Promise<DeepPartial<System>> {
    return this.loader.system().load(user)
  }

  @ResolveField('currentProgram', () => System)
  currentProgram(@Parent() user: User): Promise<DeepPartial<Program>> {
    return this.loader.program().load(user)
  }

  @ResolveField('followersCount', () => Number)
  followersCount(@Parent() user: User): Promise<number> {
    return this.loader.followersCount().load(user)
  }

  @ResolveField('followingsCount', () => Number)
  followingsCount(@Parent() user: User): Promise<number> {
    return this.loader.followingsCount().load(user)
  }

  @ResolveField('hasCurrentStory', () => Boolean)
  hasCurrentStory(@Parent() user: User): Promise<boolean> {
    return this.loader.hasCurrentStory().load(user)
  }

  @ResolveField('isFollowing', () => Boolean)
  async isFollowing(
    @CurrentUser() current: User,
    @Parent() user: User
  ): Promise<boolean> {
    if (!current) return false
    return this.loader.isFollowing().load({ current, user })
  }

  @ResolveField('seen', () => Boolean)
  async seen(
    @CurrentUser() current: User,
    @Parent() user: User
  ): Promise<boolean> {
    if (user.seen !== undefined) return user.seen
    if (!current || current === user) return false
    return this.loader.seen().load({ current, user })
  }
}
