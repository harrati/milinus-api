import { Injectable } from '@nestjs/common'
import times from 'lodash/times'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { System } from '../../modules/system/system.entity'

@Injectable()
export class FixturesSystemService {
  private readonly repository: Repository<System>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.repository = connection.getRepository(System)
  }

  async injectSystems(): Promise<System[]> {
    console.log('seeding systems...')
    const systems = times(10, () => {
      return this.repository.create({
        name: faker.lorem.word(),
        icon: faker.lorem.word(),
      })
    })
    return this.repository.save(systems)
  }
}
