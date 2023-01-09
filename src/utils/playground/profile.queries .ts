export const profileQueries = /* GraphQL */ `
  mutation updateProfilePicture {
    updateProfilePicture(pictureUrl: "image-link-here") {
      uuid
    }
  }
  mutation updateProfile {
    updateProfile(
      firstName: "xxx"
      lastName: "xxx"
      userName: "xxxx"
      email: "xxx@xxxx.com"
      phone: "xxxx"
      description: "xxxx"
      gender: MALE
      currentWeight: xxx
      wantedWeight: xxx
      height: xxx
      age: xxx
    ) {
      uuid
    }
  }

  query profiles {
    profiles(where: { search: "" }, first: 10, after: "") {
      edges {
        node {
          uuid
          email
          firstName
          lastName
          userName
          isFollowing
          pictureUrl
        }
      }
    }
  }

  query profilesUserName {
    profilesUserName(where: { search: "" }, first: 10, after: "") {
      edges{
        node{
          uuid
          userName
        }
      }
    }
  }
`
