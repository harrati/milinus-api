import { Injectable } from '@nestjs/common'
import { times, random, flatten } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { Evolution } from '../../modules/evolution/evolution.entity'
import { User } from '../../modules/user/user.entity'

@Injectable()
export class FixturesEvolutionService {
  private readonly repository: Repository<Evolution>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.repository = connection.getRepository(Evolution)
  }

  async injectEvolutions(users: User[]): Promise<Evolution[]> {
    console.log('seeding evolutions...')
    const evolutions = users.map(user => {
      const userEvolutions = times(10, () =>
        this.repository.create({
          pictureUrl: faker.image.sports(),
          weight: random(50, 90, true),
          user,
        })
      )
      return userEvolutions
    })
    return this.repository.save(flatten(evolutions))
  }
}
