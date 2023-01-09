import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { sub, add } from 'date-fns'
import { LibsService } from '../../libs/libs.service'
import { ReposService } from '../repos.service'
import { Post } from './post.entity'
import { PostReaction } from './postReaction.entity'
import {
  PostPrivacies,
  PostConnection,
  CreatePostArgs,
  OrderByFeeds,
  PeriodFeeds,
  MinStories,
} from './post.types'
import { WhereUniqueInput, OrderByDirection } from '../../utils/types'
import { User } from '../user/user.entity'
import { ERR_DUP_ENTRY } from '../../utils/constants'
import {
  NotificationStatus,
  NotificationTypes,
} from '../notification/notification.types'
import { NotificationConfig } from '../../config/config.types'
import { ConfigService } from '@nestjs/config'
import { sprintf } from 'sprintf-js'

@Injectable()
export class PostService {
  notificationConfig: NotificationConfig

  constructor(
    @InjectRepository(Post)
    public readonly postRepository: Repository<Post>,
    @InjectRepository(PostReaction)
    public readonly postReactionRepository: Repository<PostReaction>,
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService,
    public readonly libs: LibsService,
    private readonly config: ConfigService
  ) {
    this.notificationConfig = this.config.get<NotificationConfig>(
      'notification'
    )
  }

  async findByUuid(uuid: string) {
    return await this.postRepository.findOne(
      { uuid },
      { relations: ['media', 'user', 'story'] }
    )
  }
  async deleteByUuid(uuid: string) {
    return await this.postRepository.delete({ uuid })
  }
  async getFeedLast(first = 10, after?: string, duringthe?: PeriodFeeds) {
    const lastCursor = after
      ? await this.postRepository.findOne({ uuid: after })
      : null
    if (after && !lastCursor) throw new Error('pagination')
    const NbDays =
      duringthe === PeriodFeeds.LAST_24
        ? 1
        : duringthe === PeriodFeeds.LAST_48
        ? 2
        : duringthe === PeriodFeeds.LAST_72
        ? 3
        : 1
    const TodayBefore = sub(new Date(), { days: NbDays })
    const qb = this.postRepository
      .createQueryBuilder('post')
      .where('post."createdAt" >= :datebefore', {
        datebefore: TodayBefore,
      })
      .andWhere('post.privacy = :privacy', { privacy: PostPrivacies.PUBLIC })
      .addSelect(subQuery => {
        return subQuery
          .select('COALESCE(COUNT(*), 0)', 'count')
          .from(PostReaction, 'react')
          .where('post.id = react."postId"')
      }, 'count')
      .orderBy('count', 'DESC', 'NULLS LAST')

    const paginator = this.libs.paginator.getPaginator(Post, {
      first,
      after,
      alias: 'post',
    })
    return await paginator.manualPaginate(qb)
  }
  async getFeedAll(first = 10, after?: string) {
    const lastCursor = after
      ? await this.postRepository.findOne({ uuid: after })
      : null
    if (after && !lastCursor) throw new Error('pagination')
    const qb = this.postRepository
      .createQueryBuilder('post')
      .addSelect(subQuery => {
        return subQuery
          .select('COALESCE(COUNT(*), 0)', 'count')
          .from(PostReaction, 'react')
          .where('post.id = react."postId"')
      }, 'count')
      .where('post.privacy = :privacy', { privacy: PostPrivacies.PUBLIC })
      .groupBy('post.id')
      .orderBy('count', 'DESC', 'NULLS LAST')
      .addOrderBy('post.id', 'ASC')

    const paginator = this.libs.paginator.getPaginator(Post, {
      first,
      after,
      alias: 'post',
    })
    return await paginator.manualPaginate(qb)
  }
  async getFeedAlldDesc(first = 10, after?: string) {
    const lastCursor = after
      ? await this.postRepository.findOne({ uuid: after })
      : null
    if (after && !lastCursor) throw new Error('pagination')
    const qb = this.postRepository
      .createQueryBuilder('post')
      .addSelect(subQuery => {
        return subQuery
          .select('COALESCE(COUNT(*), 0)', 'count')
          .from(PostReaction, 'react')
          .where('post.id = react."postId"')
      }, 'count')
      .where('post.privacy = :privacy', { privacy: PostPrivacies.PUBLIC })
      .groupBy('post.id')
      .orderBy('count', 'DESC', 'NULLS LAST')
      .addOrderBy('post.id', 'DESC')

    const paginator = this.libs.paginator.getPaginator(Post, {
      first,
      after,
      alias: 'post',
    })
    return await paginator.manualPaginate(qb)
  }
  async getFeedMin(first = 10, after?: string, minstories?: MinStories) {
    const lastCursor = after
      ? await this.postRepository.findOne({ uuid: after })
      : null
    if (after && !lastCursor) throw new Error('pagination')

    for (let i = 1; i < 365; i++) {
      const TodayBefore = sub(new Date(), { days: i })

      const qb = await this.postRepository
        .createQueryBuilder('post')
        .where('post."createdAt" >= :datebefore', {
          datebefore: TodayBefore,
        })
        .andWhere('post.privacy = :privacy', { privacy: PostPrivacies.PUBLIC })
        .addSelect(subQuery => {
          return subQuery
            .select('COALESCE(COUNT(*), 0)', 'count')
            .from(PostReaction, 'react')
            .where('post.id = react."postId"')
        }, 'count')
        .groupBy('post.id')
        .orderBy('count', 'DESC', 'NULLS LAST')
      const MinStoires =
        minstories === MinStories.MIN_5
          ? 5
          : minstories === MinStories.MIN_10
          ? 10
          : minstories === MinStories.MIN_15
          ? 15
          : minstories === MinStories.MIN_20
          ? 20
          : minstories === MinStories.MIN_25
          ? 25
          : minstories === MinStories.MIN_50
          ? 50
          : 20
      const ControlArray = await qb.getMany()
      if (ControlArray.length >= MinStoires) {
        const paginator = this.libs.paginator.getPaginator(Post, {
          first,
          after,
          alias: 'post',
        })
        return await paginator.manualPaginate(qb)
      } else if (i === 364) {
        const paginator = this.libs.paginator.getPaginator(Post, {
          first,
          after,
          alias: 'post',
        })
        return await paginator.manualPaginate(qb)
      }
    }
  }
  async getUserFeed(
    where: WhereUniqueInput,
    currentUser: User
  ): Promise<PostConnection> {
    const isOwnUser = where.uuid === currentUser.uuid
    const user = isOwnUser
      ? currentUser
      : await this.repos.user.findByUuid(where.uuid)
    if (!user) throw new Error('not-found')

    const isFollowing = isOwnUser
      ? true
      : await this.repos.follow.isFollowing(currentUser, user)
    const qb = this.postRepository
      .createQueryBuilder('post')
      .andWhere('post."userId" = :userId', { userId: user.id })

    if (!isFollowing) {
      qb.andWhere('post.privacy = :privacy', { privacy: PostPrivacies.PUBLIC })
    }

    const paginator = this.libs.paginator.getPaginator(Post, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.DESC,
      first: null,
    })
    return await paginator.paginate(qb)
  }

  async getPostUser(uuid: string) {
    const { user } = await this.postRepository.findOne(
      { uuid },
      { relations: ['user'] }
    )
    return user
  }

  async getPostMedia(uuid: string) {
    const { media } = await this.postRepository.findOne(
      { uuid },
      { relations: ['media'] }
    )
    return media
  }

  async createPost(payload: CreatePostArgs, user: User) {
    const media = this.repos.media.mediaRepository.create({
      ...payload.media,
      user,
    })
    const createdMedia = await this.repos.media.mediaRepository.save(media)

    const post = this.postRepository.create({
      ...payload,
      media: createdMedia,
      user,
    })
    return await this.postRepository.save(post)
  }

  async createReaction(
    post: Post,
    payload: DeepPartial<PostReaction>,
    user: User,
    notification: boolean
  ) {
    try {
      const reaction = this.postReactionRepository.create({
        post,
        user,
        ...payload,
      })
      await this.postReactionRepository.save(reaction)
      if (notification && post.user.uuid !== user.uuid) {
        await this.repos.notification.sendNotificationToUser(post.user, {
          type: NotificationTypes.LIKE,
          author: user,
          user: post.user,
          post: post,
          status: NotificationStatus.UNREAD,
          body: sprintf(
            this.notificationConfig[post.user.language][NotificationTypes.LIKE],
            user
          ),
        })
      }
      return post
    } catch (error) {
      if (error.code === ERR_DUP_ENTRY) {
        throw new Error('already-exist')
      }
    }
  }

  async deleteFromUser(uuid: string, user: User) {
    const post = await this.findByUuid(uuid)
    if (post.user.id !== user.id) throw new Error('Unauthorized')
    await this.postRepository.delete({ uuid })
    return true
  }

  async getReactionsCount(id: number) {
    return await this.postReactionRepository
      .createQueryBuilder('pr')
      .select(
        "coalesce(sum(case when reaction = 'SAD' then 1 else 0 end), 0)",
        'sad'
      )
      .addSelect(
        "coalesce(sum(case when reaction = 'LOVE' then 1 else 0 end), 0)",
        'love'
      )
      .addSelect(
        "coalesce(sum(case when reaction = 'SMILE' then 1 else 0 end), 0)",
        'smile'
      )
      .addSelect(
        "coalesce(sum(case when reaction = 'ANGRY' then 1 else 0 end), 0)",
        'angry'
      )
      .addSelect(
        "coalesce(sum(case when reaction = 'FUNNY' then 1 else 0 end), 0)",
        'funny'
      )
      .addSelect(
        "coalesce(sum(case when reaction = 'EXHAUSTED' then 1 else 0 end), 0)",
        'exhausted'
      )
      .where('pr."postId" = :id', { id })
      .getRawOne()
  }

  async getFeeds(
    orderby: OrderByFeeds,
    duringthe: PeriodFeeds,
    after: string,
    first: number,
    minstories: MinStories
  ) {
    if (minstories) {
      const Feeds = await this.repos.post.getFeedMin(first, after, minstories)
      return Feeds
    } else if (orderby === OrderByFeeds.INTERACTION) {
      const Feeds = await this.repos.post.getFeedLast(first, after, duringthe)
      return Feeds
    } else if (orderby === OrderByFeeds.INTERACTION_ASC) {
      const Feeds = await this.repos.post.getFeedAll(first, after)
      return Feeds
    } else if (orderby === OrderByFeeds.INTERACTION_DSC) {
      const Feeds = await this.repos.post.getFeedAlldDesc(first, after)
      return Feeds
    }

    const Feeds = await this.repos.post.getFeedLast(first, after, duringthe)
    return Feeds
  }
}
