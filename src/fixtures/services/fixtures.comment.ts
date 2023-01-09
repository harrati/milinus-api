import { Injectable } from '@nestjs/common'
import { times, flatten, sample } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { Comment } from '../../modules/comment/comment.entity'
import { User } from '../../modules/user/user.entity'
import { Story } from '../../modules/story/story.entity'
import { Post } from '../../modules/post/post.entity'

@Injectable()
export class FixturesCommentService {
  private readonly repository: Repository<Comment>

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {
    this.repository = connection.getRepository(Comment)
  }

  async injectComments(users: User[], stories: Story[]): Promise<Comment[]> {
    console.log('seeding comments...')
    const comments = stories.map(story =>
      times(20, () =>
        this.repository.create({
          story: story,
          user: sample(users),
          content: faker.lorem.sentence(),
        })
      )
    )
    return await this.repository.save(flatten(comments))
  }

  async injectPostComments(users: User[], posts: Post[]): Promise<Comment[]> {
    console.log('seeding comments...')
    const comments = posts.map(post =>
      times(20, () =>
        this.repository.create({
          post: post,
          user: sample(users),
          content: faker.lorem.sentence(),
        })
      )
    )
    return await this.repository.save(flatten(comments))
  }
}
