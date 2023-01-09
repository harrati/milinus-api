import { Field, ID, InputType, ArgsType, Float } from '@nestjs/graphql'
import { RunningType } from './running.types'
import { CoordinateInput } from '../../utils/types'

@InputType()
export class RunningsWhereInput {
  @Field(() => ID)
  userUuid: string
}

@InputType()
export class LocationDataInput {
  @Field(() => CoordinateInput)
  coordinates: CoordinateInput
  @Field(() => Float)
  altitude: number
  @Field(() => Date)
  startedTs: string
}

@ArgsType()
export class RunningsArgs {
  @Field(() => RunningsWhereInput)
  where: RunningsWhereInput
}

@ArgsType()
export class RunningArgs {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class RunningUserTrainingInput {
  @Field(() => ID)
  trainingUuid: string
}

@InputType()
export class RunningData {
  @Field(() => RunningType)
  type: RunningType
  @Field(() => [LocationDataInput])
  locationsData: LocationDataInput[]
}

@ArgsType()
export class CreateRunningArgs {
  @Field(() => RunningUserTrainingInput)
  where: RunningUserTrainingInput
  @Field(() => RunningData)
  data: RunningData
}
