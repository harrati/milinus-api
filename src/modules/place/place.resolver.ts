import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { Place } from './place.entity'
import { PlaceConnection } from './place.types'
import { DeepPartial } from 'typeorm'
import {
  PlacesArgs,
  DeletePlaceArgs,
  CreatePlaceArgs,
  TogglePlaceArgs,
  UpdatePlaceArgs,
} from './place.inputs'

@Resolver(() => Place)
export class PlaceResolver {
  @Query(() => PlaceConnection, { description: 'Not implemented' })
  places(@Args() args: PlacesArgs): Promise<DeepPartial<PlaceConnection>> {
    console.log(args)
    return null
  }

  @Mutation(() => Place, { description: 'Not implemented' })
  tooglePlace(@Args() args: TogglePlaceArgs): Promise<DeepPartial<Place>> {
    console.log(args)
    return null
  }

  @Mutation(() => Place, { description: 'Not implemented' })
  createPlace(@Args() args: CreatePlaceArgs): Promise<DeepPartial<Place>> {
    console.log(args)
    return null
  }

  @Mutation(() => Place, { description: 'Not implemented' })
  updatePlace(@Args() args: UpdatePlaceArgs): Promise<DeepPartial<Place>> {
    console.log(args)
    return null
  }

  @Mutation(() => Place, { description: 'Not implemented' })
  deletePlace(@Args() args: DeletePlaceArgs): Promise<DeepPartial<Place>> {
    console.log(args)
    return null
  }
}
