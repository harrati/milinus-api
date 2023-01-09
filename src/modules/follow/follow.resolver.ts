import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { UserConnection } from '../user/user.types'
import { FollowersArgs, FollowingArgs, FollowArgs } from './follow.inputs'
import { User } from '../user/user.entity'
import { Follow } from './follow.entity'
import { CurrentUser } from '../../decorators'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import {
  NotificationStatus,
  NotificationTypes,
} from '../notification/notification.types'
import { NotificationConfig } from '../../config/config.types'
import { ConfigService } from '@nestjs/config'
import { sprintf } from 'sprintf-js'

@UseGuards(AuthGuard)
@Resolver(() => Follow)
export class FollowResolver {
  notificationConfig: NotificationConfig

  constructor(
    private readonly repos: ReposService,
    private readonly config: ConfigService
  ) {
    this.notificationConfig = this.config.get<NotificationConfig>(
      'notification'
    )
  }

  @Query(() => UserConnection)
  followers(
    @CurrentUser() user: User,
    @Args() args: FollowersArgs
  ): Promise<UserConnection> {
    const { first, after, where } = args
    const currentUser = where && where.userUuid ? where.userUuid : user.uuid
    const followers = this.repos.follow.getFollowers(
      first,
      currentUser,
      where,
      after
    )

    return followers
  }

  @Query(() => UserConnection)
  followings(
    @CurrentUser() user: User,
    @Args() args: FollowingArgs
  ): Promise<UserConnection> {
    const { first, after, where } = args
    const currentUser = where && where.userUuid ? where.userUuid : user.uuid
    const followers = this.repos.follow.getFollowings(
      first,
      currentUser,
      where,
      after
    )

    return followers
  }

  @Mutation(() => User)
  async toggleFollow(
    @CurrentUser() user: User,
    @Args() args: FollowArgs
  ): Promise<User> {
    const { userUuid } = args
    const member = await this.repos.user.findByUuid(userUuid)
    const isFollowing = await this.repos.follow.isFollowing(user, member)
    isFollowing
      ? await this.repos.follow.deleteFollowing(user, member)
      : await this.repos.follow.createFollowing(user, member)
    if (!isFollowing) {
      await this.repos.notification.sendNotificationToUser(member, {
        type: NotificationTypes.FOLLOW,
        status: NotificationStatus.UNREAD,
        body: sprintf(
          this.notificationConfig[member.language][NotificationTypes.FOLLOW],
          user
        ),
        user: member,
        author: user,
      })
    }

    return member
  }
}
