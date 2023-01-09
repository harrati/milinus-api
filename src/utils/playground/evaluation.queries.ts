export const evaluationQueries = /* GraphQL */ `
  mutation updateEvaluation {
    updateEvaluation(
      where: { uuid: "xxxxxxxx" }
      data: { duration: 34, exerciseUuid: "xxxxxxx" }
    ) {
      uuid
      duration
      exercise {
        uuid
      }
    }
  }
  mutation createEvaluation {
    createEvaluation(
      duration: 22
      programUuid: "xxxxxx"
      exerciseUuid: "xxxxxx"
    ) {
      uuid
      exercise {
        uuid
      }
    }
  }
`
