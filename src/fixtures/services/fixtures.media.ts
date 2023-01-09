import { Injectable } from '@nestjs/common'
import { times } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { Media } from '../../modules/media/media.entity'
import { MediaTypes } from '../../modules/media/media.types'

@Injectable()
export class FixturesMediaService {
  private readonly repository: Repository<Media>

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {
    this.repository = this.connection.getRepository(Media)
  }

  async injectMedias(): Promise<Media[]> {
    console.log('seeding medias...')

    const medias = times(100, i => {
      return this.repository.create({
        url:
          i > 50
            ? faker.image.sports()
            : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: i > 50 ? MediaTypes.IMAGE : MediaTypes.VIDEO,
      })
    })
    return await this.repository.save(medias)
  }
}
