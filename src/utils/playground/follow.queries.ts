export const followQueries = /* GraphQL */ `
  query followers {
    followers(where: { userUuid: "" }) {
      edges {
        node {
          uuid
        }
      }
    }
  }

  query followings {
    followers(where: { userUuid: "" }) {
      edges {
        node {
          uuid
        }
      }
    }
  }

  mutation toggleFollow {
    toggleFollow(userUuid: "") {
      uuid
      isFollowing
    }
  }
`
