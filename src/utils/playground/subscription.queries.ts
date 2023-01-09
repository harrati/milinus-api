export const subscriptionQueries = /* GraphQL */ `
  mutation UserSubscribeFree {
    UserSubscribeFree(uuid: "") {
      uuid
      subscriptionStatus
      EndDateSubscription
    }
  }

  mutation UserSubscribePremium {
    UserSubscribePremium(uuid: "", period: PERIOD_1) {
      uuid
      subscriptionStatus
      EndDateSubscription
    }
  }
`
