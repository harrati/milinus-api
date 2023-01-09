import { NotificationService } from './notification.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  ScheduledNotification,
  Notification,
  PushToken,
} from './notification.entity'
import { NotificationResolver } from './notification.resolver'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, ScheduledNotification, PushToken]),
  ],
  providers: [NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
