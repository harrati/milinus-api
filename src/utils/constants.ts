import { UserTrainingFrequencies } from '../modules/profile/profile.types'
import { ContactSubject } from '../modules/user/user.types'
import { PaginatorResult } from '../libs/paginator/paginator.types'

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION'
export const USER_REPOSITORY = 'USER_REPOSITORY'

export const ERR_DUP_ENTRY = '23505'
export const ANONYMOUS_USERNAME = 'Anonymous'

export const DIFFICULTY_STEP = 0.25

export const DEFAULT_VIDEO_URL =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'

export const PROGRAM_MAX_WEEKS_DURATION = 12

export const ONE_HUNDRED_PERCENT = 100

export const DAILY_MAX_RECIPE_PER_USER = 4

export const ESTIMATED_REPETITION_TIME = 3

export const AVERAGE_RUNNING_SPEED = 3

export const TRAINING_REPORT_COEFFICIENT = {
  [UserTrainingFrequencies.NOOB]: 0.8,
  [UserTrainingFrequencies.OFTEN]: 1,
  [UserTrainingFrequencies.FREQUENTLY]: 1.2,
  [UserTrainingFrequencies.WAR_MACHINE]: 1.4,
}

export const ContactSubjectMapper = {
  [ContactSubject.SUBSCRIPTION]: 'Souscriptions',
  [ContactSubject.BUGS]: 'Bugs',
  [ContactSubject.QUESTIONS]: 'Questions',
  [ContactSubject.PERSONAL_DATA]: 'Données personnelles',
  [ContactSubject.OTHERS]: 'Autres',
}

export const runningPointsMatrix = [
  [10, 3, 2, 0],
  [7, 10, 7, 3],
  [7, 7, 10, 7],
  [7, 7, 7, 10],
]

export const objectivePointsMatrix = [[10, 7, 3], [7, 10, 7], [3, 7, 10]]

export const genderPointsMatrix = [[10, 0, 5], [0, 10, 5], [5, 5, 10]]

export const bodyZonePoints = [0, 5, 7, 10, 10, 10, 10, 10]

export const EMPTY_CONNECTION = <T>(): PaginatorResult<T> => {
  const connection: PaginatorResult<T> = {
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    aggregate: {
      count: 0,
    },
    edges: [],
  }

  return connection
}
