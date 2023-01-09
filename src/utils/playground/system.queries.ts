export const systemQueries = /* GraphQL */ `
  query userSystems {
    userSystems {
      uuid
      name
      icon
      planets {
        uuid
        unlocked
        description
        name
        icon
      }
    }
  }

  mutation completeSystemTutorial {
    completeSystemTutorial {
      uuid
      hasCompletedSystemTutorial
    }
  }
`
