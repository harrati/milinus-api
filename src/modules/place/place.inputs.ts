import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import { CoordinateInput } from '../../utils/types'
import { PlaceCategories } from './place.types'

@InputType()
export class PlaceWhereUniqueId {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class PlaceWhereInput {
  @Field(() => CoordinateInput, { nullable: true })
  location: CoordinateInput
  @Field({ nullable: true })
  search: string
}

@InputType()
export class PlaceUpdateInput {
  @Field(() => CoordinateInput, { nullable: true })
  coordinates: CoordinateInput
  @Field(() => PlaceCategories, { nullable: true })
  category: PlaceCategories
  @Field({ nullable: true })
  name: string
}

@ArgsType()
export class PlacesArgs {
  @Field(() => PlaceWhereInput, { nullable: true })
  where: PlaceWhereInput
  @Field(() => Int, { nullable: true })
  first: number
  @Field(() => ID, { nullable: true })
  after: string
}

@ArgsType()
export class CreatePlaceArgs {
  @Field(() => CoordinateInput)
  coordinates: CoordinateInput
  @Field(() => PlaceCategories)
  category: PlaceCategories
  @Field()
  name: string
  @Field(() => ID, { nullable: true })
  uuid: string
}

@ArgsType()
export class UpdatePlaceArgs {
  @Field(() => PlaceWhereUniqueId)
  where: PlaceWhereUniqueId
  @Field(() => PlaceUpdateInput)
  data: PlaceUpdateInput
}

@ArgsType()
export class DeletePlaceArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class TogglePlaceArgs {
  @Field(() => ID)
  uuid: string
}
