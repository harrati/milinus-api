import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { Report } from './report.entity'
import {
  ReportConnection,
  ReportStatus,
  ReportActions,
  ReportCategories,
} from './report.types'
import {
  ReportsArgs,
  ReportArgs,
  ProcessReportArgs,
  CreateReportArgs,
} from './report.inputs'
import { DeepPartial } from 'typeorm'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { Story } from '../story/story.entity'
import { ReportLoader } from './report.loader'
import { Comment } from '../comment/comment.entity'
import { UserLanguage, UserStatus } from '../user/user.types'
import { LibsService } from '../../libs/libs.service'
import { SortOptions } from './report.service'
import { Post } from '../post/post.entity'
import {
  NotificationStatus,
  NotificationTypes,
} from '../notification/notification.types'
import { NotificationConfig } from '../../config/config.types'
import { ConfigService } from '@nestjs/config'

@UseGuards(AuthGuard)
@Resolver(() => Report)
export class ReportResolver {
  notificationConfig: NotificationConfig

  constructor(
    private readonly repos: ReposService,
    private readonly loader: ReportLoader,
    private readonly libs: LibsService,
    private readonly config: ConfigService
  ) {
    this.notificationConfig = this.config.get<NotificationConfig>(
      'notification'
    )
  }

  @Query(() => ReportConnection)
  reports(@Args() args: ReportsArgs): Promise<DeepPartial<ReportConnection>> {
    const { after, first, where, last, before, sort, order } = args
    return this.repos.report.getReports(
      where,
      first,
      after,
      last,
      before,
      sort as SortOptions,
      order
    )
  }

  @Query(() => Report)
  report(@Args() args: ReportArgs): Promise<DeepPartial<Report>> {
    return this.repos.report.findByUuid(args.uuid)
  }

  @Mutation(() => Report, { nullable: true })
  async processReport(
    @Args() args: ProcessReportArgs
  ): Promise<DeepPartial<Report>> {
    const {
      data: { action },
      where,
    } = args
    const report = await this.repos.report.getReporWithRelations(where.uuid)
    if (!report) throw new Error("Report Not Found")

    const content: any = [
      { d: report['comment'], r: this.repos.comment, },
      { d: report['post'], r: this.repos.post, },
      { d: report['story'], r: this.repos.story, }].filter(c => Boolean(c.d))[0]
    const reportedUser = (await content.r.findByUuid(content.d.uuid)).user

    if (action === ReportActions.DELETE) {
      switch (report.category) {
        case ReportCategories.COMMENT:
          const userComment = await this.repos.comment.getCommentUser(
            report.comment.uuid
          )
          const templateComment =
            userComment.language === UserLanguage.FR
              ? 'deletedContent'
              : 'deletedContentEN'
          this.libs.mailjet.send(templateComment, userComment)
          await this.repos.comment.deleteByUuid(report.comment.uuid)
          await this.repos.notification.sendNotificationToUser(userComment, {
            type: NotificationTypes.DELETE_COMMENT,
            status: NotificationStatus.UNREAD,
            body: this.notificationConfig[userComment.language][
              NotificationTypes.DELETE_COMMENT
            ],
            user: userComment,
          })
          break;
        case ReportCategories.STORY:
          const userStory = await this.repos.story.getStoryUser(report.story.uuid)
          const templateStory =
            userStory.language === UserLanguage.FR
              ? 'deletedContent'
              : 'deletedContentEN'
          this.libs.mailjet.send(templateStory, userStory)
          await this.repos.story.deleteByUuid(report.story.uuid)
          await this.repos.notification.sendNotificationToUser(userStory, {
            type: NotificationTypes.DELETE_PUBLICATION,
            status: NotificationStatus.UNREAD,
            body: this.notificationConfig[userStory.language][
              NotificationTypes.DELETE_PUBLICATION
            ],
            user: userStory,
          })
          break;
        case ReportCategories.POST:
          const user = await this.repos.post.getPostUser(report.post.uuid)
          const template =
            user.language === UserLanguage.FR
              ? 'deletedContent'
              : 'deletedContentEN'
          this.libs.mailjet.send(template, user)
          await this.repos.post.deleteByUuid(report.post.uuid)
          await this.repos.notification.sendNotificationToUser(user, {
            type: NotificationTypes.DELETE_PUBLICATION,
            status: NotificationStatus.UNREAD,
            body: this.notificationConfig[user.language][
              NotificationTypes.DELETE_PUBLICATION
            ],
            user: user,
          })
          break;
        default:
          throw new Error("This ReportCategory is not supported yet by the backend, see ya soon!")
      }
      return null
    }

    if (action === ReportActions.BAN) {
      const template =
        report.user.language === UserLanguage.FR ? 'userBan' : 'userBanEN'
      await this.repos.user.updateUserStatus(reportedUser, UserStatus.BANNED)
      this.libs.mailjet.send(template, reportedUser)
    }

    const payload = {
      status: ReportStatus.TREATED,
    }
    return this.repos.report.updateReport(where, payload)
  }

  @Mutation(() => Report)
  async createReport(
    @CurrentUser() user: User,
    @Args() args: CreateReportArgs
  ): Promise<DeepPartial<Report>> {
    const {
      where: { postUuid, storyUuid, commentUuid },
    } = args
    if (!storyUuid && !commentUuid && !postUuid) throw new Error('not-found')
    const payload: DeepPartial<Report> = {
      story: null,
      comment: null,
      post: null,
      status: ReportStatus.UNTREATED,
      user,
    }

    if (storyUuid) {
      payload.story = await this.repos.story.findByUuid(storyUuid)
      payload.category = ReportCategories.STORY
    }

    if (postUuid) {
      payload.post = await this.repos.post.findByUuid(postUuid)
      payload.category = ReportCategories.POST
    }

    if (commentUuid) {
      payload.comment = await this.repos.comment.findByUuid(commentUuid)
      payload.category = ReportCategories.COMMENT
    }

    return this.repos.report.createReport(payload)
  }

  @ResolveField('story', () => Story)
  async story(@Parent() report: Report): Promise<Story> {
    return await this.loader.story().load(report)
  }

  @ResolveField('post', () => Story)
  async post(@Parent() report: Report): Promise<Post> {
    return await this.loader.post().load(report)
  }

  @ResolveField('comment', () => Comment)
  async comment(@Parent() report: Report): Promise<Comment> {
    return await this.loader.comment().load(report)
  }

  @ResolveField('user', () => User)
  async user(@Parent() report: Report): Promise<User> {
    return await this.loader.user().load(report)
  }

  @ResolveField('userReported', () => User)
  async userReported(@Parent() report: Report): Promise<User> {
    const story = await this.loader.story().load(report)
    const comment = await this.loader.comment().load(report)
    const post = await this.loader.post().load(report)
    if (story) {
      return await this.repos.story.getStoryUser(story.uuid)
    }
    if (comment) {
      return await this.repos.comment.getCommentUser(comment.uuid)
    }
    if (post) {
      return await this.repos.post.getPostUser(post.uuid)
    }
  }

  @ResolveField('numberOfReportsByUser', () => User)
  async numberOfReportsByUser(@Parent() report: Report): Promise<number> {
    const user = await this.loader.user().load(report)
    return await this.loader.count().load(user)
  }
}
