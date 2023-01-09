export const feedQueries = /* GraphQL */ `
  query feeds {
    feeds(minstories: MIN_10, first: 5) {
      edges {
        node {
          uuid
          createdAt
          description
          user {
            email
          }
          reactions {
            smile
            angry
            love
            sad
            exhausted
            funny
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      aggregate {
        count
      }
    }
  }

  query rankings {
    rankings(where: { search: "mendo" }) {
      edges {
        cursor
        node {
          points
          position
          user {
            userName
            firstName
            uuid
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      aggregate {
        count
      }
    }
  }

  query followers {
    followers(where: { search: "gui" }) {
      edges {
        node {
          uuid
          userName
        }
      }
    }
  }

  query followings {
    followings(where: { search: "gigi" }) {
      edges {
        node {
          uuid
          userName
        }
      }
    }
  }
`
