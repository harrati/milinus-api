import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import {
  NotificationConnection,
  ScheduledNotificationConnection,
} from './notification.types'
import { DeepPartial } from 'typeorm'
import {
  NotificationsArgs,
  ScheduledNotificationsArgs,
  ReadNotificationArgs,
  UpdateNotificationSettingsArgs,
  CreateScheduledNotificationArgs,
  UpdateScheduledNotificationArgs,
  DeleteScheduledNotificationArgs,
  ScheduledNotificationArgs,
  CreatePushTokenArgs,
} from './notification.inputs'
import {
  Notification,
  ScheduledNotification,
  PushToken,
} from './notification.entity'
import { ReposService } from '../repos.service'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
@UseGuards(AuthGuard)
@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly repos: ReposService) {}
  @Query(() => NotificationConnection)
  notifications(
    @CurrentUser() user: User,
    @Args() args: NotificationsArgs
  ): Promise<DeepPartial<NotificationConnection>> {
    const { first, after, status } = args
    return this.repos.notification.getNotifications(user, first, status, after)
  }

  @Query(() => ScheduledNotificationConnection)
  scheduledNotifications(
    @Args() args: ScheduledNotificationsArgs
  ): Promise<DeepPartial<ScheduledNotificationConnection>> {
    const { orderBy, orderByDirection, after, first, last, before } = args
    return this.repos.notification.getScheduledNotifications(
      orderBy,
      orderByDirection,
      first,
      last,
      after,
      before
    )
  }

  @Query(() => ScheduledNotification)
  scheduledNotification(
    @Args() args: ScheduledNotificationArgs
  ): Promise<DeepPartial<ScheduledNotification>> {
    const {
      where: { uuid },
    } = args
    return this.repos.notification.findScheduledNotificationByUuid(uuid)
  }

  @Mutation(() => Notification)
  readNotification(
    @Args() args: ReadNotificationArgs
  ): Promise<DeepPartial<Notification>> {
    const { uuid } = args
    return this.repos.notification.readNotification(uuid)
  }

  @Mutation(() => User)
  updateNotificationSettings(
    @Args() args: UpdateNotificationSettingsArgs,
    @CurrentUser() user: User
  ): Promise<DeepPartial<User>> {
    const payload = {
      notificationSettings: args,
    }
    return this.repos.user.updateAndFetch(user, payload)
  }

  @Mutation(() => PushToken)
  registerPushToken(
    @Args() args: CreatePushTokenArgs,
    @CurrentUser() user: User
  ): Promise<DeepPartial<PushToken>> {
    const data = {
      user,
      ...args,
    }
    return this.repos.notification.createPushToken(data, user)
  }

  @Mutation(() => ScheduledNotification)
  createScheduledNotification(
    @Args() args: CreateScheduledNotificationArgs
  ): Promise<DeepPartial<ScheduledNotification>> {
    return this.repos.notification.createScheduledNotification(args)
  }

  @Mutation(() => ScheduledNotification)
  updateScheduledNotification(
    @Args() args: UpdateScheduledNotificationArgs
  ): Promise<DeepPartial<Notification>> {
    const { where, data } = args
    return this.repos.notification.updateScheduledNotification(where, data)
  }

  @Mutation(() => Boolean)
  deleteScheduledNotification(
    @Args() args: DeleteScheduledNotificationArgs
  ): boolean {
    const { uuid } = args
    this.repos.notification.deleteScheduledNotification(uuid)
    return true
  }
}
