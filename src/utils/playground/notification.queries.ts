export const notificationQueries = /* GraphQL */ `
  query  notifications{
    notifications {
    edges{
      node{
    ...notificationFragment
      }
    }
      aggregate{
        count
      }
    }
  }
  mutation  readNotification{
    readNotification(uuid:"xxxxx") {
    ...notificationFragment
    }
  }
  mutation  updateNotificationSettings{
    updateNotificationSettings(trainingReminder:INACTIVE, publish:INACTIVE,news:INACTIVE) {
    uuid
     notificationSettings {
      trainingReminder
      publish
      news
    }
    }
  }
  mutation registerPushToken {
  registerPushToken(token: "") {
    uuid
    token
  }
}

  notificationFragment on Notification{
    uuid
    route
    type
    status
  }
`
