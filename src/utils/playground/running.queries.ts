export const runningQueries = /* GraphQL */ `
  mutation createRunning {
    createRunning(
      where: { trainingUuid: "0f6518b6-57ed-4cdb-b2a9-88b34f48d80d" }
      data: {
        type: DISTANCE
        LocationsData: [
          {
            coordinates: { longitude: 7.455, latitude: 51.246 }
            altitude: 345
            startedTs: "2020-07-10T18:16:11.820Z"
          }
          {
            coordinates: { longitude: 7.456, latitude: 51.247 }
            altitude: 300
            startedTs: "2020-07-10T18:16:11.820Z"
          }
          {
            coordinates: { longitude: 7.457, latitude: 51.289 }
            altitude: 600
            startedTs: "2020-07-10T18:16:11.820Z"
          }
        ]
      }
    ) {
      uuid
      type
      locationsData {
        altitude
        startedTs
        coordinates {
          latitude
          longitude
        }
      }
    }
  }
`
