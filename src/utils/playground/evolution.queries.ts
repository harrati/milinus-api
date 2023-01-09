export const evolutionQueries = /* GraphQL */ `
  mutation($pictureUrl: Upload!) {
    createEvolution(weight: 12.4, pictureUrl: $pictureUrl) {
      uuid
      weight
      pictureUrl
    }
  }

  query evolutions {
    evolutions(
      where: {
        start: "2020-06-03T15:00:17.226Z"
        end: "2020-06-03T15:00:20.226Z"
      }
      first: 10
      after: "xxxxxxxxxxxxxx"
    ) {
      edges {
        node {
          uuid
          pictureUrl
          weight
          createdAt
        }
      }
    }
  }

  query evolution {
    evolution(uuid: "xxxxxxxxxxxxxxxxxxx") {
      watermarkedPictureUrl
    }
  }
`
