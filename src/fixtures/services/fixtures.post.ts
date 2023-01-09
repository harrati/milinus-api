import { Injectable } from '@nestjs/common'
import { pick, times } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { User } from '../../modules/user/user.entity'

import { Post } from '../../modules/post/post.entity'
import { PostPrivacies } from '../../modules/post/post.types'
import { Media } from '../../modules/media/media.entity'
import { MediaTypes } from '../../modules/media/media.types'
import Aigle from 'aigle'

@Injectable()
export class FixturesPostService {
  private readonly postRepository: Repository<Post>
  private readonly mediaRepository: Repository<Media>

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {
    this.postRepository = this.connection.getRepository(Post)
    this.mediaRepository = this.connection.getRepository(Media)
  }

  async injectPost(users: User[]): Promise<Post[]> {
    console.log('seeding post...')
    let posts: Post[] = []

    await Aigle.resolve(users).map(async (user, i) => {
      const medias = times(20, j => {
        return this.mediaRepository.create({
          url:
            i > 50
              ? faker.image.sports()
              : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          type: j > 50 ? MediaTypes.IMAGE : MediaTypes.VIDEO,
          user,
        })
      })
      const createdMedias = await this.mediaRepository.save(medias)

      const postsToCreate = createdMedias.map(media => {
        return this.postRepository.create({
          pictureUrl: 'https://ekladata.com/VuNLyNSWht1TdvlTR1dkEk73A78.jpg',
          user: user,
          privacy: i > 5 ? PostPrivacies.PRIVATE : PostPrivacies.PUBLIC,
          description: faker.lorem.word(),
          media,
        })
      })
      const createdPosts = await this.postRepository.save(postsToCreate)
      posts = posts.concat(createdPosts)
    })

    return posts
  }
}
