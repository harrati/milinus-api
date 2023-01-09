import { Injectable } from '@nestjs/common'
import { times, random, sample, flatten } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import {
  Notification,
  ScheduledNotification,
} from '../../modules/notification/notification.entity'
import { User } from '../../modules/user/user.entity'
import { Comment } from '../../modules/comment/comment.entity'
import { Story } from '../../modules/story/story.entity'
import {
  NotificationStatus,
  NotificationTypes,
} from '../../modules/notification/notification.types'

@Injectable()
export class FixturesNotificationService {
  private readonly notificationRepository: Repository<Notification>
  private readonly scheduledNotificationRepository: Repository<
    ScheduledNotification
  >

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.notificationRepository = connection.getRepository(Notification)
    this.scheduledNotificationRepository = connection.getRepository(
      ScheduledNotification
    )
  }

  async injectNotifications(
    users: User[],
    comments: Comment[],
    stories: Story[]
  ): Promise<Notification[]> {
    console.log('seeding notifications...')
    const scheduledNotifications = times(20, () =>
      this.scheduledNotificationRepository.create({
        title: faker.lorem.word(),
        content: faker.lorem.words(),
        scheduledAt: faker.date.soon(random(1, 10)),
      })
    )
    await this.scheduledNotificationRepository.save(scheduledNotifications)

    const notifications = users.map(user =>
      times(10, () => {
        const type = sample(NotificationTypes)
        return this.notificationRepository.create({
          type: type,
          status: NotificationStatus.UNREAD,
          user: user,
          ...(type === NotificationTypes.COMMENT
            ? { comment: sample(comments), author: sample(users) }
            : null),
          ...(type === NotificationTypes.LIKE
            ? { author: sample(users), story: sample(stories) }
            : null),
        })
      })
    )
    return await this.notificationRepository.save(flatten(notifications))
  }
}
