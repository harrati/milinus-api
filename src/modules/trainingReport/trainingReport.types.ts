import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Exercise } from '../exercise/exercise.entity'

@ObjectType()
export class ExerciseReport {
  @Field(() => Int)
  reps: number
  @Field(() => Exercise)
  exercise: Exercise
}

@ObjectType()
export class WeightTrainingReport {
  @Field(() => ExerciseReport)
  first: ExerciseReport
  @Field(() => ExerciseReport, { nullable: true })
  second: ExerciseReport
  @Field(() => Int)
  totalWeight: number
}

@ObjectType()
export class RunningTrainingReport {
  @Field(() => Int)
  distance: number
  @Field(() => Int)
  speed: number
  @Field(() => Int)
  altitude: number
}

@ObjectType()
export class FitnessTrainingReport {
  @Field(() => ExerciseReport)
  first: ExerciseReport
  @Field(() => ExerciseReport, { nullable: true })
  second: ExerciseReport
  @Field(() => Int)
  distance: number
}
