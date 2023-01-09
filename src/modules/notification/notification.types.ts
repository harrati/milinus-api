import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { Aggregate, PageInfo } from '../../utils/types'
import { ScheduledNotification, Notification } from './notification.entity'

@ObjectType()
export class NotificationEdge {
  @Field(() => Notification)
  node: Notification
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class NotificationConnection {
  @Field(() => [NotificationEdge])
  edges: NotificationEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

@ObjectType()
export class ScheduledNotificationEdge {
  @Field(() => ScheduledNotification)
  node: ScheduledNotification
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class ScheduledNotificationConnection {
  @Field(() => [ScheduledNotificationEdge])
  edges: ScheduledNotificationEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum NotificationTypes {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  PLANET = 'PLANET',
  NEWS = 'NEWS',
  OFFER = 'OFFER',
  NO_PROGRAM = 'NO_PROGRAM',
  HALF_PROGRAM = 'HALF_PROGRAM',
  DELETE_COMMENT = 'DELETE_COMMENT',
  DELETE_PUBLICATION = 'DELETE_PUBLICATION',
  FOLLOW = 'FOLLOW',
}
registerEnumType(NotificationTypes, { name: 'NotificationTypes' })

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}
registerEnumType(NotificationStatus, { name: 'NotificationStatus' })

export enum ScheduledNotificationsOrderBy {
  ID = 'id',
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  SCHEDULED_AT = 'scheduledAt',
}
registerEnumType(ScheduledNotificationsOrderBy, {
  name: 'ScheduledNotificationsOrderBy',
})

export enum NotificationSettingsTypes {
  NEWS = 'news',
  PUBLISH = 'publish',
  TRAINING_REMINDER = 'trainingReminder',
}
registerEnumType(NotificationSettingsTypes, {
  name: 'NotificationSettingsTypes',
})
