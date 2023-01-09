import { Injectable } from '@nestjs/common'
import { times, sample, flatten, sampleSize, random } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { Story } from '../../modules/story/story.entity'
import { User } from '../../modules/user/user.entity'
import { ReactionType } from '../../modules/story/story.types'
import { StoryReaction } from '../../modules/story/storyReaction.entity'
import { StoryView } from '../../modules/story/storyView.entity'
import { PostReaction } from '../../modules/post/postReaction.entity'
import { Post } from '../../modules/post/post.entity'
import { Media } from '../../modules/media/media.entity'

@Injectable()
export class FixturesStoryService {
  private readonly storyRepository: Repository<Story>
  private readonly storyReactionRepository: Repository<StoryReaction>
  private readonly storyViewRepository: Repository<StoryView>
  private readonly postReactionRepository: Repository<PostReaction>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.storyRepository = connection.getRepository(Story)
    this.storyReactionRepository = connection.getRepository(StoryReaction)
    this.storyViewRepository = connection.getRepository(StoryView)
    this.postReactionRepository = connection.getRepository(PostReaction)
  }

  async injectStories(users: User[], medias: Media[]): Promise<Story[]> {
    console.log('seeding stories...')
    const stories = users.map(user => {
      return times(3, () => {
        const media = sample(medias)
        return this.storyRepository.create({
          user: user,
          description: faker.lorem.word(),
          media: {
            ...media,
            user,
          },
        })
      })
    })
    return this.storyRepository.save(flatten(stories))
  }

  async injectStoryReactions(stories: Story[], users: User[]): Promise<void> {
    console.log('seeding story reactions...')
    const reactions = stories.map(story => {
      const randomUsers = sampleSize(users, random(1, users.length))
      return times(randomUsers.length, n =>
        this.storyReactionRepository.create({
          story: story,
          user: randomUsers[n],
          reaction: sample(ReactionType),
        })
      )
    })
    await this.storyReactionRepository.save(flatten(reactions))
  }

  async injectPostReactions(posts: Post[], users: User[]): Promise<void> {
    console.log('seeding post reactions...')
    const reactions = posts.map(post => {
      const randomUsers = sampleSize(users, random(1, users.length))
      return times(randomUsers.length, n =>
        this.postReactionRepository.create({
          post,
          user: randomUsers[n],
          reaction: sample(ReactionType),
        })
      )
    })
    await this.postReactionRepository.save(flatten(reactions))
  }

  async injectStoryView(stories: Story[], users: User[]): Promise<void> {
    console.log('seeding stories views...')

    const storyViews = stories.map((story: Story) =>
      this.storyViewRepository.create({
        user: sample(users),
        story,
      })
    )
    await this.storyViewRepository.save(storyViews)
  }
}
