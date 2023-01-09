/* eslint-disable prettier/prettier */
export const authQueries = /* GraphQL */`
mutation signIn {
  signIn(email: "jawad@totem.paris", password: "totem") {
    token
  }
}

mutation signInAdmin {
  signInAdmin(email: "admin1@totem.paris", password: "totem") {
    token
  }
}

query randomPrograms {
  randomPrograms {
    edges {
      node {
        uuid
      }
    }
  }
}

query programs {
  programs {
    edges {
      node {
        uuid
      }
    }
  }
}
query randomExercises {
  randomExercises {
    edges {
      node {
        uuid
        format
      }
    }
  }
}
`
