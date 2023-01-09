import {
  registerEnumType,
  ObjectType,
  Field,
  ID,
  Int,
  Float,
} from '@nestjs/graphql'
import { User } from './user.entity'
import { PageInfo, Aggregate, ToggleStatus } from '../../utils/types'

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
  INACTIVE = 'INACTIVE',
}
registerEnumType(UserStatus, { name: 'UserStatus' })

export enum UserLanguage {
  EN = 'EN',
  FR = 'FR',
}
registerEnumType(UserLanguage, { name: 'UserLanguage' })

export enum UserSubscriptionStatus {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}
registerEnumType(UserSubscriptionStatus, { name: 'UserSubscriptionStatus' })

export enum UserSubscriptionPeriod {
  PERIOD_1 = '3',
  PERIOD_2 = '6',
  PERIOD_3 = '12',
}
registerEnumType(UserSubscriptionPeriod, { name: 'UserSubscriptionPeriod' })

export enum ContactSubject {
  SUBSCRIPTION = 'SUBSCRIPTION',
  BUGS = 'BUGS',
  QUESTIONS = 'QUESTIONS',
  PERSONAL_DATA = 'PERSONAL_DATA',
  OTHERS = 'OTHERS',
}
registerEnumType(ContactSubject, { name: 'ContactSubject' })

@ObjectType()
export class UserStat {
  @Field(() => Int)
  cal: number
  @Field(() => Int)
  trainings: number
  @Field(() => Int)
  points: number
}

export enum UserGenders {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
}
registerEnumType(UserGenders, { name: 'UserGenders' })

@ObjectType()
class UserEdge {
  @Field(() => User)
  node!: User

  @Field(() => ID)
  cursor!: string
}

@ObjectType()
export class UserConnection {
  @Field(() => PageInfo)
  pageInfo!: PageInfo

  @Field(() => Aggregate)
  aggregate!: Aggregate

  @Field(() => [UserEdge])
  edges!: UserEdge[]
}

@ObjectType()
export class NotificationSettings {
  @Field(() => ToggleStatus)
  trainingReminder: ToggleStatus
  @Field(() => ToggleStatus)
  publish: ToggleStatus
  @Field(() => ToggleStatus)
  news: ToggleStatus
}

export class ExerciseParamsType {
  repetition: number
  maxWeight: number
}

@ObjectType()
export class ChartWeightBoundaries {
  @Field(() => Float)
  min: number
  @Field(() => Float)
  max: number
}
