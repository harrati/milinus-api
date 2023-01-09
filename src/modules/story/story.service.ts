import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { sub } from 'date-fns'
import { Story } from './story.entity'
import { StoryConnection } from './story.types'
import { StoryReaction } from './storyReaction.entity'
import { LibsService } from '../../libs/libs.service'
import { User } from '../user/user.entity'
import { CreateStoryArgs } from './story.inputs'
import { OrderByDirection } from '../../utils/types'
import { ReposService } from '../repos.service'
import { UserConnection } from '../user/user.types'
import { StoryView } from './storyView.entity'
import { ERR_DUP_ENTRY, EMPTY_CONNECTION } from '../../utils/constants'
import Aigle from 'aigle'
import { head, map, orderBy } from 'lodash'
import {
  NotificationStatus,
  NotificationTypes,
} from '../notification/notification.types'
import { NotificationConfig } from '../../config/config.types'
import { ConfigService } from '@nestjs/config'
import { sprintf } from 'sprintf-js'

@Injectable()
export class StoryService {
  notificationConfig: NotificationConfig

  constructor(
    @InjectRepository(Story)
    public readonly storyRepository: Repository<Story>,
    @InjectRepository(StoryReaction)
    public readonly storyReactionRepository: Repository<StoryReaction>,
    @InjectRepository(StoryView)
    public readonly storyViewRepository: Repository<StoryView>,
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
    return await this.storyRepository.findOne(
      { uuid },
      { relations: ['media', 'user', 'post'] }
    )
  }

  async getStories(currentUser: User): Promise<UserConnection> {
    const followerIds = await this.repos.follow.getFollowingIds(currentUser)
    const paginator = this.libs.paginator.getPaginator(User, {
      orderBy: 'createdAt',
      orderByDirection: OrderByDirection.DESC,
      first: null,
    })

    if (!followerIds.length) {
      return EMPTY_CONNECTION<User>()
    }

    const qb = this.repos.user.userRepository
      .createQueryBuilder('user')
      .distinct(true)
      .where('user.id IN (:...userIds)', { userIds: followerIds })
      .innerJoinAndSelect('user.stories', 'story', 'story.expired = :expired', {
        expired: false,
      })
      .orderBy('user.id', 'DESC')
      .addOrderBy('story."createdAt"', 'DESC')
    const result = await paginator.paginate(qb)

    const edges = await Aigle.resolve(result.edges).map(async edge => {
      const { node, cursor } = edge
      const stories = await this.repos.story.getUserStories(node)

      const storyViewCount = await this.storyViewRepository
        .createQueryBuilder('st')
        .where('st."storyId" IN (:...storyIds)', {
          storyIds: map(stories, 'id'),
        })
        .andWhere('st."userId" = :userId', { userId: currentUser.id })
        .getCount()
      const orderedStories = orderBy(stories, story => story.createdAt, 'desc')
      return {
        node: {
          ...node,
          seen: storyViewCount === stories.length,
          createdAt: head(orderedStories).createdAt,
        },
        cursor,
      }
    })
    const sortedEdges = orderBy(edges, edge => edge.node.createdAt, 'desc')
    const sortedEdgesSeen = orderBy(sortedEdges, edge => edge.node.seen, 'asc')

    return {
      ...result,
      edges: sortedEdgesSeen,
    }
  }

  async getUserStoriesConnection(userUuid: string): Promise<StoryConnection> {
    const user = await this.repos.user.findByUuid(userUuid)
    const qb = this.storyRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.media', 'media')
      .where('story."userId" = :userId', { userId: user.id })
      .andWhere('story.expired = :expired', { expired: false })

    const paginator = this.libs.paginator.getPaginator(Story, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.ASC,
      first: null,
      last: null,
    })
    return await paginator.paginate(qb)
  }

  async getUserStories(user: User): Promise<Story[]> {
    return await this.storyRepository
      .createQueryBuilder('story')
      .where('story."userId" = :userId', { userId: user.id })
      .andWhere('story.expired = :expired', { expired: false })
      .getMany()
  }

  async getStoryUser(uuid: string) {
    const { user } = await this.storyRepository.findOne(
      { uuid },
      { relations: ['user'] }
    )
    return user
  }

  async repostStory(uuid: string, user: User) {
    const story = await this.storyRepository.findOneOrFail(
      { uuid },
      { relations: ['media'] }
    )
    const storyToCreate = this.storyRepository.create({
      description: story.description,
      media: story.media,
      user,
    })

    return await this.storyRepository.save(storyToCreate)
  }

  async repostPost(uuid: string, user: User) {
    const post = await this.repos.post.postRepository.findOneOrFail(
      { uuid },
      { relations: ['media'] }
    )
    const storyToCreate = this.storyRepository.create({
      description: post.description,
      media: post.media,
      user,
    })

    return await this.storyRepository.save(storyToCreate)
  }

  async createReaction(
    story: Story,
    payload: DeepPartial<StoryReaction>,
    user: User,
    notification: boolean
  ) {
    try {
      const reaction = this.storyReactionRepository.create({
        story,
        user,
        ...payload,
      })
      await this.storyReactionRepository.save(reaction)
      if (notification && story.user.uuid !== user.uuid) {
        await this.repos.notification.sendNotificationToUser(story.user, {
          type: NotificationTypes.LIKE,
          author: user,
          user: story.user,
          story: story,
          status: NotificationStatus.UNREAD,
          body: sprintf(
            this.notificationConfig[story.user.language][
              NotificationTypes.LIKE
            ],
            user
          ),
        })
      }
      return story
    } catch (error) {
      if (error.code === ERR_DUP_ENTRY) {
        throw new Error('already-exist')
      }
    }
  }

  async createStory(payload: CreateStoryArgs, user: User) {
    const medias = this.repos.media.mediaRepository.create(
      payload.medias.map(media => ({
        url: media.url,
        type: media.type,
        mute: media.mute,
        user,
      }))
    )
    const createdMedias = await this.repos.media.mediaRepository.save(medias)

    const stories = createdMedias.map(media =>
      this.storyRepository.create({
        description: payload.description,
        media,
        user,
      })
    )
    return await this.storyRepository.save(stories)
  }

  async seeStory(uuid: string, user: User) {
    const story = await this.storyRepository.findOneOrFail({ uuid })
    await this.storyViewRepository
      .createQueryBuilder('st')
      .insert()
      .into(StoryView)
      .values({ user: user, story: story })
      .onConflict(`ON CONSTRAINT "US_UNIQUE" DO NOTHING`)
      .execute()
    return { ...story, seen: true }
  }

  async deleteByUuid(uuid: string) {
    return await this.storyRepository.delete({ uuid })
  }

  async deleteFromUser(uuid: string, user: User) {
    const story = await this.findByUuid(uuid)
    if (!story) throw new Error('not-found')
    if (story.user.id !== user.id) throw new Error('Unauthorized')
    await this.storyRepository.delete({ uuid })
    return true
  }

  async hasSeenStory(story: Story, user: User): Promise<boolean> {
    const hasSeen = await this.storyViewRepository.count({
      where: { user, story },
    })
    return !!hasSeen
  }

  async hasCurrentStory(user: User): Promise<boolean> {
    const story = await this.storyRepository
      .createQueryBuilder('story')
      .andWhere('story.expired = :expired', { expired: false })
      .andWhere('story."userId" = :userId', { userId: user.id })
      .getOne()
    return !!story
  }

  async postponeStories() {
    const { affected } = await this.storyRepository
      .createQueryBuilder('story')
      .update()
      .set({ createdAt: sub(new Date(), { hours: 1 }) })
      .andWhere('story."createdAt" < :datelimit', {
        datelimit: sub(new Date(), { days: 1 }),
      })
      .execute()

    return affected
  }

  async expireStories() {
    const { affected } = await this.storyRepository
      .createQueryBuilder('story')
      .update()
      .set({ expired: true })
      .andWhere('story."createdAt" < :datelimit', {
        datelimit: sub(new Date(), { days: 1 }),
      })
      .execute()

    return affected
  }

  async getStoryMedia(uuid: string) {
    const { media } = await this.storyRepository.findOne(
      { uuid },
      { relations: ['media'] }
    )
    return media
  }

  async getReactionsCount(id: number) {
    return await this.storyReactionRepository
      .createQueryBuilder('sr')
      .select(
        "COALESCE(sum(case when reaction = 'SAD' then 1 else 0 end), 0)",
        'sad'
      )
      .addSelect(
        "COALESCE(sum(case when reaction = 'LOVE' then 1 else 0 end), 0)",
        'love'
      )
      .addSelect(
        "COALESCE(sum(case when reaction = 'SMILE' then 1 else 0 end), 0)",
        'smile'
      )
      .addSelect(
        "COALESCE(sum(case when reaction = 'ANGRY' then 1 else 0 end), 0)",
        'angry'
      )
      .addSelect(
        "COALESCE(sum(case when reaction = 'FUNNY' then 1 else 0 end), 0)",
        'funny'
      )
      .addSelect(
        "COALESCE(sum(case when reaction = 'EXHAUSTED' then 1 else 0 end), 0)",
        'exhausted'
      )
      .where('sr."storyId" = :id', { id })
      .getRawOne()
  }
}
