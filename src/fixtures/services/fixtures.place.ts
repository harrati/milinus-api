import { Injectable } from '@nestjs/common'
import { times, sample } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { Place } from '../../modules/place/place.entity'
import { User } from '../../modules/user/user.entity'
import { PlaceUser } from '../../modules/place/placeUser.entity'
import { PlaceCategories } from '../../modules/place/place.types'

@Injectable()
export class FixturesPlaceService {
  private readonly placeRepository: Repository<Place>
  private readonly placeUserRepository: Repository<PlaceUser>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.placeRepository = connection.getRepository(Place)
    this.placeUserRepository = connection.getRepository(PlaceUser)
  }

  async injectPlaces(users: User[]): Promise<Place[]> {
    console.log('seeding places...')
    const places = times(20, () =>
      this.placeRepository.create({
        name: faker.company.companyName() || 'test',
        category: sample(PlaceCategories) || PlaceCategories.GYM,
        coordinates: {
          longitude: parseFloat(faker.address.longitude()) || 4.4,
          latitude: parseFloat(faker.address.latitude()) || 1.6,
        },
      })
    )
    const createdPlaces = await this.placeRepository.save(places)

    console.log('seeding user/places relation...')
    const placeUsers = users.map(user =>
      this.placeUserRepository.create({
        user: user,
        place: sample(places),
      })
    )

    await this.placeUserRepository.save(placeUsers)

    return createdPlaces
  }
}
