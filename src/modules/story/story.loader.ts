import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'

import { Story } from './story.entity'
import { User } from '../user/user.entity'
import { Media } from '../media/media.entity'
import { Reactions } from './story.types'

type StoryWithUser = {
  story: Story
  user: User
}

@Injectable()
export class StoryLoader {
  constructor(private readonly repos: ReposService) {}

  seen() {
    return new DataLoader<StoryWithUser, boolean>(async data =>
      Promise.all(
        data.map(async data => {
          const { story, user } = data
          return await this.repos.story.hasSeenStory(story, user)
        })
      )
    )
  }

  media() {
    return new DataLoader<Story, Media>(async stories =>
      Promise.all(
        stories.map(async story => {
          return await this.repos.story.getStoryMedia(story.uuid)
        })
      )
    )
  }

  user() {
    return new DataLoader<Story, User>(async stories =>
      Promise.all(
        stories.map(async story => {
          return await this.repos.story.getStoryUser(story.uuid)
        })
      )
    )
  }

  reactions() {
    return new DataLoader<Story, Reactions>(async stories =>
      Promise.all(
        stories.map(async story => {
          return await this.repos.story.getReactionsCount(story.id)
        })
      )
    )
  }
}
