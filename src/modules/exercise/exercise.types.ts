import {
  ObjectType,
  Field,
  registerEnumType,
  Float,
  Int,
  ID,
} from '@nestjs/graphql'
import { Exercise } from './exercise.entity'
import { Aggregate, PageInfo } from '../../utils/types'

export enum ExerciseFormat {
  REPETITION = 'REPETITION',
  TIME = 'TIME',
  METER = 'METER',
}
registerEnumType(ExerciseFormat, { name: 'ExerciseFormat' })

export enum ExerciseTypes {
  BODYBUILDING = 'BODYBUILDING',
  FITNESS = 'FITNESS',
  PILATE = 'PILATE',
  STRETCHING = 'STRETCHING',
  RUNNING = 'RUNNING',
}
registerEnumType(ExerciseTypes, { name: 'ExerciseTypes' })

export enum ExerciseReferences {
  ROWING = 'ROWING',
  DEADLIFT = 'DEADLIFT',
  SQUAT = 'SQUAT',
  DVC = 'DVC',
}
registerEnumType(ExerciseReferences, { name: 'ExerciseReferences' })

@ObjectType()
export class DifficultyScaleRules {
  @Field(() => Int)
  start: number
  @Field(() => Int)
  end: number
  @Field(() => Float)
  step: number
}
@ObjectType()
export class DifficultyScale {
  @Field(() => ExerciseFormat)
  format: ExerciseFormat
  @Field(() => Float)
  initialDifficulty: number
  @Field(() => Int)
  maxNumber: number
  @Field(() => [DifficultyScaleRules])
  difficultyScaleRules: DifficultyScaleRules[]
}

@ObjectType()
export class ExerciseEdge {
  @Field(() => Exercise)
  node: Exercise
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class ExerciseConnection {
  @Field(() => [ExerciseEdge])
  edges: ExerciseEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}
