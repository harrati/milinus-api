import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { User } from '../user/user.entity'
import { Post } from './post.entity'
import { Media } from '../media/media.entity'
import { Reactions } from '../story/story.types'

@Injectable()
export class PostLoader {
  constructor(private readonly repos: ReposService) {}

  user() {
    return new DataLoader<Post, User>(async posts =>
      Promise.all(
        posts.map(async post => {
          return await this.repos.post.getPostUser(post.uuid)
        })
      )
    )
  }

  media() {
    return new DataLoader<Post, Media>(async posts =>
      Promise.all(
        posts.map(async post => {
          return await this.repos.post.getPostMedia(post.uuid)
        })
      )
    )
  }

  reactions() {
    return new DataLoader<Post, Reactions>(async posts =>
      Promise.all(
        posts.map(async post => {
          return await this.repos.post.getReactionsCount(post.id)
        })
      )
    )
  }
}
