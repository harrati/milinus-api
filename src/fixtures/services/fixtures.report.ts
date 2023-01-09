import { Injectable } from '@nestjs/common'
import { flatten, concat, sampleSize } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { Report } from '../../modules/report/report.entity'
import { User } from '../../modules/user/user.entity'
import { Story } from '../../modules/story/story.entity'
import { Comment } from '../../modules/comment/comment.entity'
import {
  ReportStatus,
  ReportCategories,
} from '../../modules/report/report.types'
import { Post } from '../../modules/post/post.entity'

@Injectable()
export class FixturesReportService {
  private readonly repository: Repository<Report>

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {
    this.repository = connection.getRepository(Report)
  }

  async injectReports(
    users: User[],
    comments: Comment[],
    stories: Story[],
    posts: Post[]
  ): Promise<Report[]> {
    console.log('seeding comment reports...')
    const commentReports = users.map(user => {
      const randomComments = sampleSize(comments, 5)
      return randomComments.map(comment => {
        return this.repository.create({
          comment,
          user,
          status: ReportStatus.UNTREATED,
          category: ReportCategories.COMMENT,
        })
      })
    })

    console.log('seeding story reports...')
    const storyReports = users.map(user => {
      const randomStories = sampleSize(stories, 5)
      return randomStories.map(story => {
        return this.repository.create({
          story,
          user,
          status: ReportStatus.UNTREATED,
          category: ReportCategories.STORY,
        })
      })
    })

    console.log('seeding posts reports...')
    const postReports = users.map(user => {
      const randomPosts = sampleSize(posts, 5)
      return randomPosts.map(post => {
        return this.repository.create({
          post,
          user,
          status: ReportStatus.UNTREATED,
          category: ReportCategories.POST,
        })
      })
    })

    const reports = concat(commentReports, storyReports, postReports)
    return this.repository.save(flatten(reports))
  }
}
