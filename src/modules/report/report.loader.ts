import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { Story } from '../story/story.entity'
import { Report } from './report.entity'
import { Comment } from '../comment/comment.entity'
import { User } from '../user/user.entity'
import { Post } from '../post/post.entity'

@Injectable()
export class ReportLoader {
  constructor(private readonly repos: ReposService) {}

  story() {
    return new DataLoader<Report, Story>(async data =>
      Promise.all(
        data.map(async report => {
          return await this.repos.report.getReportStory(report.uuid)
        })
      )
    )
  }

  comment() {
    return new DataLoader<Report, Comment>(async data =>
      Promise.all(
        data.map(async report => {
          return await this.repos.report.getReportComment(report.uuid)
        })
      )
    )
  }

  user() {
    return new DataLoader<Report, User>(async data =>
      Promise.all(
        data.map(async report => {
          return await this.repos.report.getReportUser(report.uuid)
        })
      )
    )
  }

  post() {
    return new DataLoader<Report, Post>(async data =>
      Promise.all(
        data.map(async report => {
          return await this.repos.report.getReportPost(report.uuid)
        })
      )
    )
  }
  count() {
    return new DataLoader<User, number>(async data =>
      Promise.all(
        data.map(async user => {
          return await this.repos.report.countReportsByUser(user)
        })
      )
    )
  }
}
