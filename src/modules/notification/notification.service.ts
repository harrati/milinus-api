import { Injectable } from '@nestjs/common'
import {
  Notification,
  ScheduledNotification,
  PushToken,
} from './notification.entity'
import { LibsService } from '../../libs/libs.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeepPartial } from 'typeorm'
import {
  CreateScheduledNotificationArgs,
  CreatePushTokenArgs,
} from './notification.inputs'
import { WhereUniqueInput, OrderByDirection } from '../../utils/types'
import {
  ScheduledNotificationsOrderBy,
  NotificationTypes,
  NotificationStatus,
} from './notification.types'
import { User } from '../user/user.entity'
import { ConfigService } from '@nestjs/config'
import { NotificationConfig } from '../../config/config.types'

@Injectable()
export class NotificationService {
  notificationConfig: NotificationConfig

  constructor(
    @InjectRepository(Notification)
    public readonly notificationRepository: Repository<Notification>,
    @InjectRepository(ScheduledNotification)
    public readonly scheduledNotificationRepository: Repository<
      ScheduledNotification
    >,
    @InjectRepository(PushToken)
    public readonly pushTokenRepository: Repository<PushToken>,
    private readonly libs: LibsService,
    private readonly config: ConfigService
  ) {
    this.notificationConfig = this.config.get<NotificationConfig>(
      'notification'
    )
  }

  async createNotification(
    notificationPayload: DeepPartial<Notification>
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationPayload)
    return await this.notificationRepository.save(notification)
  }

  findScheduledNotificationByUuid(
    uuid: string
  ): Promise<DeepPartial<ScheduledNotification>> {
    return this.scheduledNotificationRepository.findOne({ uuid })
  }

  async getNotifications(
    user: User,
    first = 10,
    status?: NotificationStatus,
    after?: string
  ) {
    const qb = this.notificationRepository.createQueryBuilder('notification')
    qb.where('notification."userId" = :userId', { userId: user.id })
      .leftJoinAndSelect('notification.author', 'author')
      .leftJoinAndSelect('notification.story', 'story')
      .leftJoinAndSelect('notification.comment', 'comment')
      .leftJoinAndSelect('notification.post', 'post')

    if (status) {
      qb.andWhere('notification.status = :status', { status: status })
    }

    const paginator = this.libs.paginator.getPaginator(Notification, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.DESC,
      first,
      after,
    })
    const connection = await paginator.paginate(qb)
    return connection
  }

  async getScheduledNotifications(
    orderBy?: ScheduledNotificationsOrderBy,
    orderByDirection?: OrderByDirection,
    first = 10,
    last = 10,
    after?: string,
    before?: string
  ) {
    const qb = this.scheduledNotificationRepository.createQueryBuilder(
      'schedulednotification'
    )

    const paginator = this.libs.paginator.getPaginator(ScheduledNotification, {
      orderBy,
      orderByDirection,
      first,
      after,
      last,
      before,
    })
    const connection = await paginator.paginate(qb)

    return connection
  }

  async createScheduledNotification(
    scheduledNotificationPayload: DeepPartial<CreateScheduledNotificationArgs>
  ): Promise<ScheduledNotification> {
    const scheduledNotification = this.scheduledNotificationRepository.create(
      scheduledNotificationPayload as DeepPartial<ScheduledNotification>
    )
    return await this.scheduledNotificationRepository.save(
      scheduledNotification
    )
  }

  async readNotification(uuid: string): Promise<Notification> {
    const payload = {
      status: 'READ',
    }
    await this.notificationRepository.update(
      { uuid },
      { ...(payload as DeepPartial<Notification>) }
    )
    const updatedNotification = await this.notificationRepository.findOneOrFail(
      {
        uuid,
      }
    )
    return updatedNotification
  }

  async updateScheduledNotification(
    scheduledNotification: WhereUniqueInput,
    payload: DeepPartial<ScheduledNotification>
  ): Promise<ScheduledNotification> {
    await this.scheduledNotificationRepository.update(
      { uuid: scheduledNotification.uuid },
      { ...(payload as DeepPartial<ScheduledNotification>) }
    )
    const updatedScheduledNotification = await this.scheduledNotificationRepository.findOneOrFail(
      {
        uuid: scheduledNotification.uuid,
      }
    )
    return updatedScheduledNotification
  }

  async deleteScheduledNotification(uuid: string) {
    await this.scheduledNotificationRepository.delete({ uuid })
  }

  async getScheduledNotificationsForSending(): Promise<
    Array<ScheduledNotification>
  > {
    const dateNow = new Date(Date.now()).toISOString()

    const qb = this.scheduledNotificationRepository.createQueryBuilder(
      'schedulednotification'
    )
    qb.where('schedulednotification.scheduledAt <= :date', {
      date: dateNow,
    }).andWhere('schedulednotification.sent = :sent', { sent: false })

    return qb.getMany()
  }

  async createPushToken(
    pushTokenPayload: DeepPartial<CreatePushTokenArgs>,
    user: User
  ): Promise<PushToken> {
    const userPushToken = await this.pushTokenRepository.findOne({
      token: pushTokenPayload.token,
    })
    if (userPushToken) {
      await this.pushTokenRepository.update(
        { uuid: userPushToken.uuid },
        { token: pushTokenPayload.token }
      )
      const updatedToken = await this.pushTokenRepository.findOneOrFail({
        uuid: userPushToken.uuid,
      })
      return updatedToken
    }
    const pushToken = this.pushTokenRepository.create(
      pushTokenPayload as DeepPartial<PushToken>
    )
    return await this.pushTokenRepository.save(pushToken)
  }

  async deletePushToken(token: string) {
    await this.pushTokenRepository.delete({ token })
  }

  async sendNotificationToUser(
    user: User,
    notification: DeepPartial<Notification>
  ) {
    let tokens = user.pushTokens
    if (!user.pushTokens) {
      tokens = await this.pushTokenRepository.find({ user })
    }
    const createdNotification = await this.createNotification(notification)
    this.libs.expo.sendPushNotification(createdNotification, tokens)
  }

  async sendPlanetNotificationToUser(user: User) {
    const notification = {
      title: '',
      body: this.notificationConfig[user.language][NotificationTypes.PLANET],
      type: NotificationTypes.PLANET,
      status: NotificationStatus.UNREAD,
    }
    this.sendNotificationToUser(user, notification)
  }

  async sendHalfProgramNotificationToUser(user: User) {
    const notification = {
      title: '',
      body: this.notificationConfig[user.language][
        NotificationTypes.HALF_PROGRAM
      ],
      type: NotificationTypes.HALF_PROGRAM,
      status: NotificationStatus.UNREAD,
    }
    this.sendNotificationToUser(user, notification)
  }

  async sendNotificationToUsers(
    users: User[],
    notification: DeepPartial<Notification>
  ) {
    users.map(async (user: User) => {
      const notificationData = {
        ...notification,
        user,
        body: this.notificationConfig[user.language][NotificationTypes.OFFER],
      }
      this.sendNotificationToUser(user, notificationData)
    })
  }

  async sendNotificationToUsersWithDemand(
    users: User[],
    notification: DeepPartial<Notification>,
    titleEn: string,
    contentEn: string
  ) {
    users.map(async (user: User) => {
      const notificationData = {
        ...notification,
        user,
        body: user.language === 'FR' ? notification.body : contentEn,
        title: user.language === 'FR' ? notification.title : titleEn,
      }
      this.sendNotificationToUser(user, notificationData)
    })
  }
}
