import { Injectable } from '@nestjs/common'
import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import {
  Notification,
  PushToken,
} from '../../modules/notification/notification.entity'
import { isArray } from 'lodash'

@Injectable()
export class ExpoService {
  private expo: Expo
  constructor() {
    this.expo = new Expo()
  }

  async sendPushNotification(
    notification: Notification,
    pushTokens: PushToken[]
  ) {
    const notifications: Array<ExpoPushMessage> = []
    if (!isArray(pushTokens)) return
    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken.token)) {
        console.error(
          `Push token ${pushToken.token} is not a valid Expo push token`
        )
        continue
      }

      notifications.push({
        to: pushToken.token,
        sound: 'default',
        title: notification.title ? notification.title : '',
        body: notification.body,
        data: { route: notification.route },
      })
    }

    const chunks = this.expo.chunkPushNotifications(notifications)

    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk)
        console.log(receipts)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
