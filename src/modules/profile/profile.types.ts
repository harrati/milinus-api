import { registerEnumType, ObjectType, Field } from '@nestjs/graphql'

export enum DevicePlaforms {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}
registerEnumType(DevicePlaforms, { name: 'DevicePlaforms' })

export enum UserTrainingFrequencies {
  NOOB = 'NOOB',
  OFTEN = 'OFTEN',
  FREQUENTLY = 'FREQUENTLY',
  WAR_MACHINE = 'WAR_MACHINE',
}
registerEnumType(UserTrainingFrequencies, { name: 'UserTrainingFrequencies' })

export enum UserObjectives {
  LOOSE_WEIGHT = 'LOOSE_WEIGHT',
  STAY_INSHAPE = 'STAY_INSHAPE',
  BUILD_UP = 'BUILD_UP',
}
registerEnumType(UserObjectives, { name: 'UserObjectives' })

export enum UserRunningCapacities {
  CANT_RUN = 'CANT_RUN',
  RUN_15 = 'RUN_15',
  RUN_30 = 'RUN_30',
  RUN_60 = 'RUN_60',
}
registerEnumType(UserRunningCapacities, { name: 'UserRunningCapacities' })

export enum UserProgramSchedules {
  ONCE = 'ONCE',
  TWICE = 'TWICE',
  TRICE = 'TRICE',
  MORE = 'MORE',
}
registerEnumType(UserProgramSchedules, { name: 'UserProgramSchedules' })

export enum BodyAreas {
  ASS = 'ASS',
  THIGH = 'THIGH',
  ABS = 'ABS',
  BACK = 'BACK',
  CHEST = 'CHEST',
  ARMS = 'ARMS',
  SHOULDERS = 'SHOULDERS',
  FULL_BODY = 'FULL_BODY',
  CARDIO = 'CARDIO',
}
registerEnumType(BodyAreas, { name: 'BodyAreas' })

export enum TrainingEquipments {
  NONE = 'NONE',
  WEIGHT_BAR = 'WEIGHT_BAR',
  DUMBBELL = 'DUMBBELL',
  BENCH = 'BENCH',
  DRAW_BAR = 'DRAW_BAR',
}
registerEnumType(TrainingEquipments, { name: 'TrainingEquipments' })

export enum WeightBarLevels {
  YES = 'YES',
  NO = 'NO',
}
registerEnumType(WeightBarLevels, { name: 'WeightBarLevels' })

@ObjectType()
export class Profile {
  @Field(() => Number)
  kcal: number
  @Field(() => Number)
  trainingNumber: number
  @Field(() => Number)
  points: number
}
