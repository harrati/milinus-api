import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { User } from '../user/user.entity'
import { Comment } from './comment.entity'
import { Post } from '../post/post.entity'
import { Story } from '../story/story.entity'

@Injectable()
export class CommentLoader {
  constructor(private readonly repos: ReposService) {}

  user() {
    return new DataLoader<Comment, DeepPartial<User>>(async data =>
      Promise.all(
        data.map(async comment => {
          const user = await this.repos.comment.getCommentUser(comment.uuid)
          return user
        })
      )
    )
  }

  post() {
    return new DataLoader<Comment, Post>(async data =>
      Promise.all(
        data.map(async comment => {
          return await this.repos.comment.getCommentPost(comment.uuid)
        })
      )
    )
  }

  story() {
    return new DataLoader<Comment, Story>(async data =>
      Promise.all(
        data.map(async comment => {
          return await this.repos.comment.getCommentStory(comment.uuid)
        })
      )
    )
  }
}
