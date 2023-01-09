import {
  UserTrainingFrequencies,
  UserRunningCapacities,
  UserProgramSchedules,
  UserObjectives,
} from '../modules/profile/profile.types'
import { UserGenders } from '../modules/user/user.types'

export const trainingFrequencyMapper = {
  [UserTrainingFrequencies.NOOB]: 1,
  [UserTrainingFrequencies.OFTEN]: 2,
  [UserTrainingFrequencies.FREQUENTLY]: 3,
  [UserTrainingFrequencies.WAR_MACHINE]: 4,
}

export const UserProgramScheduleMapper = {
  [UserProgramSchedules.ONCE]: 1,
  [UserProgramSchedules.TWICE]: 2,
  [UserProgramSchedules.TRICE]: 3,
  [UserProgramSchedules.MORE]: 4,
}

export const userGenderMapper = {
  [UserGenders.FEMALE]: 0,
  [UserGenders.MALE]: 1,
  [UserGenders.NON_BINARY]: 2,
}

export const UserProgramScheduleToFrequencyMapper = {
  [UserProgramSchedules.ONCE]: UserTrainingFrequencies.NOOB,
  [UserProgramSchedules.TWICE]: UserTrainingFrequencies.OFTEN,
  [UserProgramSchedules.TRICE]: UserTrainingFrequencies.FREQUENTLY,
  [UserProgramSchedules.MORE]: UserTrainingFrequencies.WAR_MACHINE,
}

export const trainingFrequencyMapperZeroIndexed = {
  [UserTrainingFrequencies.NOOB]: 0,
  [UserTrainingFrequencies.OFTEN]: 1,
  [UserTrainingFrequencies.FREQUENTLY]: 2,
  [UserTrainingFrequencies.WAR_MACHINE]: 3,
}

export const userObjectiveMapperZeroIndexed = {
  [UserObjectives.BUILD_UP]: 0,
  [UserObjectives.STAY_INSHAPE]: 1,
  [UserObjectives.LOOSE_WEIGHT]: 2,
}

export const userRunningMapper = {
  [UserRunningCapacities.CANT_RUN]: 0,
  [UserRunningCapacities.RUN_15]: 1,
  [UserRunningCapacities.RUN_30]: 2,
  [UserRunningCapacities.RUN_60]: 3,
}
