import { Injectable } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import {
  Cron,
  CronExpression,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule'
import { CronJob } from 'cron'
import { ConfigService } from '@nestjs/config'
import { LibsService } from '../libs/libs.service'
import { ReposService } from '../modules/repos.service'
import {
  ScheduledNotification,
  Notification,
} from '../modules/notification/notification.entity'
import { User } from '../modules/user/user.entity'
import {
  NotificationStatus,
  NotificationTypes,
  NotificationSettingsTypes,
} from '../modules/notification/notification.types'
import { DeepPartial } from 'typeorm'
import { UserStatus, UserSubscriptionStatus } from '../modules/user/user.types'
import { NotificationConfig } from '../config/config.types'
import { sprintf } from 'sprintf-js'
import { sub } from 'date-fns'

enum CronTab {
  EVERY_FOURTH_DAY = '0 16 */4 * *',
  EVERY_SEVENTH_DAY = '0 12 */7 * *',
  EVERY_MONDAY = '0 9 * * MON',
  EVERY_TEN_MINUTE = '*/10 * * * *',
  EVERY_FIVE_MINUTE = '*/5 * * * *',
  EVERY_MINUTE = '*/1 * * * *',
}

@Injectable()
export class TasksService {
  notificationConfig: NotificationConfig
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService,
    private readonly libs: LibsService,
    private readonly repos: ReposService
  ) {
    this.notificationConfig = this.config.get<NotificationConfig>(
      'notification'
    )
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'scheduledNotificationsSend',
  })
  async sendScheduledNotifications() {
    const scheduledNotifications = await this.repos.notification.getScheduledNotificationsForSending()
    const users = await this.repos.user.findAllByActiveNotificationSetting(
      NotificationSettingsTypes.NEWS
    )
    scheduledNotifications.map(
      async (scheduledNotification: ScheduledNotification) => {
        const notification: DeepPartial<Notification> = {
          route: scheduledNotification.route,
          title: scheduledNotification.title,
          body: scheduledNotification.content,
          status: NotificationStatus.UNREAD,
          type: NotificationTypes.NEWS,
        }

        const titleEn = scheduledNotification.titleEn
        const contentEn = scheduledNotification.contentEn
        this.repos.notification.sendNotificationToUsersWithDemand(
          users,
          notification,
          titleEn,
          contentEn
        )
        this.repos.notification.updateScheduledNotification(
          { uuid: scheduledNotification.uuid },
          { sent: true }
        )
      }
    )
  }

  @Cron(CronTab.EVERY_MONDAY, {
    name: 'sendNotificationToNonPremiumUser',
  })
  async sendNotificationToNonPremiumUser() {
    const users = await this.repos.user.findAllBySubscriptionStatus(
      UserSubscriptionStatus.FREE
    )

    const notification: DeepPartial<Notification> = {
      route: '',
      title: '',
      status: NotificationStatus.UNREAD,
      type: NotificationTypes.OFFER,
    }
    this.repos.notification.sendNotificationToUsers(users, notification)
  }

  @Cron(CronTab.EVERY_FOURTH_DAY, {
    name: 'sendNotificationToUserWithoutProgram',
  })
  async sendNotificationToUserWithoutProgram() {
    const users = await this.repos.user.findAllWithoutProgramStarted()
    users.map((user: User) => {
      const notification: DeepPartial<Notification> = {
        route: '',
        title: '',
        body: sprintf(
          this.notificationConfig[user.language][NotificationTypes.NO_PROGRAM],
          user
        ),
        status: NotificationStatus.UNREAD,
        type: NotificationTypes.NO_PROGRAM,
      }
      this.repos.notification.sendNotificationToUser(user, notification)
    })
  }

  @Cron(CronTab.EVERY_FIVE_MINUTE, {
    name: 'expireStories',
  })
  async expireStories() {
    const affected = await this.repos.story.expireStories()
    Logger.log(`Expiring ${affected} stories`)
  }

  @Cron('* * * * *', {
    name: 'processUserRequest',
  })
  async processUserRequest() {
    const requests = await this.repos.userRequest.getPendingRequests()
    await Promise.all(
      requests.map(async request => {
        await this.repos.userRequest.processRequest(request)
      })
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'userActivityCheck',
  })
  async userActivityCheck() {
    //fetch inactive users and set status to inactive and email to inactive
    const inactiveUsers = await this.repos.user.getUsersBy(
      UserStatus.ACTIVE,
      sub(new Date(), { days: 465 }),
      'lastLogin'
    )

    await Promise.all(
      inactiveUsers.map(async user => {
        await this.repos.user.updateAndFetch(user, {
          status: UserStatus.INACTIVE,
          email: 'INACTIVE-' + user.email,
          processedAt: new Date(),
        })
      })
    )

    //fetch banned users if ban older then 1 year and delete them
    const inactiveUsersForDeleting = await this.repos.user.getUsersBy(
      UserStatus.INACTIVE,
      sub(new Date(), { days: 365 }),
      'processedAt'
    )

    await Promise.all(
      inactiveUsersForDeleting.map(async user => {
        await this.repos.user.delete(user)
      })
    )

    //fetch banned users if ban older then 1 year and delete them
    const bannedUsersForDeleting = await this.repos.user.getUsersBy(
      UserStatus.BANNED,
      sub(new Date(), { days: 365 }),
      'processedAt'
    )

    await Promise.all(
      bannedUsersForDeleting.map(async user => {
        await this.repos.user.delete(user)
      })
    )

    //fetch deleted users if delete older then 1 year and delete them
    const deletedUsersForDeleting = await this.repos.user.getUsersBy(
      UserStatus.DELETED,
      sub(new Date(), { days: 365 }),
      'processedAt'
    )

    await Promise.all(
      deletedUsersForDeleting.map(async user => {
        await this.repos.user.delete(user)
      })
    )

    //manage subscriptions - delete PREMIUM status older than endtimsubscription
    const preniumUser = await this.repos.user.findAllBySubscriptionStatus(
      UserSubscriptionStatus.PREMIUM
    )
    this.repos.user.verifyPreniumSubscription(preniumUser)
  }

  @Timeout(1000)
  checkCronJobEnvironment() {
    const stage = this.config.get('stage')
    const processName = process.env.name
    if (
      (stage === 'production' || stage === 'staging') &&
      processName === 'milinus-api'
    )
      return
    const crons: Map<string, CronJob> = this.schedulerRegistry.getCronJobs()
    for (const [name, cron] of crons) {
      if (name === 'expireStories' && processName === 'milinus-api') continue
      Logger.log(`Stopping cron ${name}`)
      cron.stop()
    }
  }
}
