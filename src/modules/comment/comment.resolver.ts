import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { Comment } from './comment.entity'
import {
  StoryCommentArgs,
  UpdateCommentArgs,
  CreateCommentArgs,
  CommentArgs,
} from './comment.inputs'
import { CommentConnection } from './comment.types'
import { ReposService } from '../repos.service'
import { User } from '../user/user.entity'
import { CurrentUser } from '../../decorators'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { DeepPartial } from 'typeorm'
import { CommentLoader } from './comment.loader'
import { UserStatus } from '../user/user.types'
import { ANONYMOUS_USERNAME } from '../../utils/constants'
import { Story } from '../story/story.entity'
import { Post } from '../post/post.entity'
import { Nullable } from '../../utils/types'
import {
  NotificationStatus,
  NotificationTypes,
} from '../notification/notification.types'
import { ConfigService } from '@nestjs/config'
import { NotificationConfig } from '../../config/config.types'
import { sprintf } from 'sprintf-js'

@UseGuards(AuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  notificationConfig: NotificationConfig
  constructor(
    private readonly repos: ReposService,
    private readonly loader: CommentLoader,
    private readonly config: ConfigService
  ) {
    this.notificationConfig = this.config.get<NotificationConfig>(
      'notification'
    )
  }
  @Query(() => CommentConnection)
  comments(@Args() args: StoryCommentArgs): Promise<CommentConnection> {
    const {
      where: { storyUuid, postUuid },
      first,
      after,
    } = args
    if ((!storyUuid && !postUuid) || (storyUuid && postUuid))
      throw new Error('invalid-input')

    if (storyUuid) {
      return this.repos.comment.findByStory(storyUuid, first, after)
    }
    return this.repos.comment.findByPost(postUuid, first, after)
  }

  @Mutation(() => Comment)
  async createComment(
    @CurrentUser() user: User,
    @Args() args: CreateCommentArgs
  ): Promise<Comment> {
    const {
      where: { storyUuid, postUuid },
      data,
    } = args

    if ((!storyUuid && !postUuid) || (storyUuid && postUuid))
      throw new Error('invalid-input')
    const payload: DeepPartial<Comment> = { user, ...data }

    if (storyUuid) {
      payload.story = await this.repos.story.findByUuid(storyUuid)
    }
    if (postUuid) {
      payload.post = await this.repos.post.findByUuid(postUuid)
    }

    const comment = await this.repos.comment.create(payload)

    const userToSend = postUuid ? payload.post.user : payload.story.user

    if (userToSend.uuid !== user.uuid) {
      await this.repos.notification.sendNotificationToUser(userToSend as User, {
        status: NotificationStatus.UNREAD,
        type: NotificationTypes.COMMENT,
        body: sprintf(
          this.notificationConfig[userToSend.language][
            NotificationTypes.COMMENT
          ],
          user
        ),
        author: user,
        comment: comment,
        user: userToSend,
      })
    }
    return comment
  }

  @Mutation(() => Comment)
  updateComment(
    @CurrentUser() user: User,
    @Args() args: UpdateCommentArgs
  ): Promise<Comment> {
    const {
      where: { uuid },
      data,
    } = args
    return this.repos.comment.updateAndFetch(uuid, data, user)
  }

  @Mutation(() => Boolean)
  deleteComment(
    @CurrentUser() user: User,
    @Args() args: CommentArgs
  ): Promise<boolean> {
    return this.repos.comment.deleteFromUser(args.uuid, user)
  }

  @ResolveField('user', () => User)
  async user(@Parent() comment: Comment): Promise<DeepPartial<User>> {
    const user = await this.loader.user().load(comment)
    if (user.status === UserStatus.BANNED) {
      user.userName = ANONYMOUS_USERNAME
      user.firstName = ANONYMOUS_USERNAME
      user.lastName = ANONYMOUS_USERNAME
    }
    return user
  }

  @ResolveField('post', () => Post)
  async post(@Parent() comment: Comment): Promise<Nullable<Post>> {
    return await this.loader.post().load(comment)
  }

  @ResolveField('story', () => Story)
  async story(@Parent() comment: Comment): Promise<Nullable<Story>> {
    return await this.loader.story().load(comment)
  }
}
