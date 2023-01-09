/* eslint-disable prettier/prettier */
export const programQueries = /* GraphQL */ `
query currentProgram {
  currentProgram {
    ...UserProgramFragment
  }
}

mutation startProgram {
  startProgram(uuid: "") {
    ...UserProgramFragment
  }
}

mutation stopProgram {
  stopProgram
}

mutation duplicateProgram {
  duplicateProgram(uuid:"") { 
    uuid
    name
    trainings {
      uuid
      position
      groups {
        uuid
      }
    }
    trainingGroups {
      uuid
    }
  }
}

mutation completeCurrentTraining {
  completeCurrentTraining(duration: 50, finisher: false) {
    ...UserTrainingFragment
  }
}

mutation completeEvaluation {
  completeEvaluation(result: 40) {
    uuid
    result
  }
}

query userTraining {
  userTraining(userTrainingUuid: "") {
    ...UserTrainingFragment
  }
}

fragment UserTrainingFragment on UserTraining {
  status
  training {
    equipments
    bodyAreas
    description
  }
  report {
    points
    kcal
    duration
    weightTrainingReport {
      first {
        ...ExerciseReportFragment
      }
      second {
        ...ExerciseReportFragment
      }
      totalWeight
    }
    runningTrainingReport {
      distance
      speed
      altitude
    }
    fitnessTrainingReport {
      first {
        ...ExerciseReportFragment
      }
      second {
        ...ExerciseReportFragment
      }
      distance
    }
  }
}

fragment UserProgramFragment on UserProgram {
  uuid
  isEvaluationDue
  evaluationSchedule
  currentTrainingIndex
  userEvaluations {
    uuid
  }
  program {
    uuid
  }
  userTrainings {
    status
  }
}

fragment ExerciseReportFragment on ExerciseReport {
  reps
  exercise {
    uuid
  }
}
`
