import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql'
import { ToggleStatus, OrderByDirection } from '../../utils/types'
import {
  NotificationStatus,
  ScheduledNotificationsOrderBy,
} from './notification.types'

@InputType()
export class ScheduledNotificationWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class ScheduledNotificationArgs {
  @Field()
  where: ScheduledNotificationWhereUniqueInput
}

@InputType()
export class ScheduledNotificationUpdateInput {
  @Field({ nullable: true })
  title?: string
  @Field({ nullable: true })
  content?: string
  @Field({ nullable: true })
  titleEn?: string
  @Field({ nullable: true })
  contentEn?: string
  @Field(() => Date, { nullable: true })
  scheduledAt?: Date
  @Field({ nullable: true })
  route?: string
}

@ArgsType()
export class NotificationsArgs {
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => NotificationStatus, { nullable: true })
  status?: NotificationStatus
}

@ArgsType()
export class ScheduledNotificationsArgs {
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  last?: number
  @Field(() => ID, { nullable: true })
  before?: string
  @Field(() => ScheduledNotificationsOrderBy, { nullable: true })
  orderBy?: ScheduledNotificationsOrderBy
  @Field(() => OrderByDirection, { nullable: true })
  orderByDirection?: OrderByDirection
}

@ArgsType()
export class ReadNotificationArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class CreatePushTokenArgs {
  @Field(() => String)
  token: string
}

@ArgsType()
export class UpdateNotificationSettingsArgs {
  @Field(() => ToggleStatus)
  trainingReminder: ToggleStatus
  @Field(() => ToggleStatus)
  publish: ToggleStatus
  @Field(() => ToggleStatus)
  news: ToggleStatus
}

@ArgsType()
export class CreateScheduledNotificationArgs {
  @Field()
  title: string
  @Field()
  content: string
  @Field({ nullable: true })
  titleEn?: string
  @Field({ nullable: true })
  contentEn?: string
  @Field(() => Date)
  scheduledAt: Date
  @Field({ nullable: true })
  route: string
}

@ArgsType()
export class UpdateScheduledNotificationArgs {
  @Field(() => ScheduledNotificationWhereUniqueInput)
  where: ScheduledNotificationWhereUniqueInput
  @Field(() => ScheduledNotificationUpdateInput)
  data: ScheduledNotificationUpdateInput
}

@ArgsType()
export class DeleteScheduledNotificationArgs {
  @Field(() => ID)
  uuid: string
}
