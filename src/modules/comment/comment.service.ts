import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Comment } from './comment.entity'
import { Repository, DeepPartial } from 'typeorm'
import { ReposService } from '../repos.service'
import { LibsService } from '../../libs/libs.service'
import { OrderByDirection } from '../../utils/types'
import { User } from '../user/user.entity'

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    public readonly commentRepository: Repository<Comment>,
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService,
    public readonly libs: LibsService
  ) {}

  findByUuid(uuid: string, relations?: string[]): Promise<Comment> {
    return this.commentRepository.findOne({ uuid }, { relations })
  }

  async findByStory(uuid: string, first: number, after: string) {
    const story = await this.repos.story.findByUuid(uuid)
    if (!story) throw new Error('not-found')
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment."storyId" = :storyId', { storyId: story.id })

    const paginator = this.libs.paginator.getPaginator(Comment, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.ASC,
      first,
      after,
    })
    return await paginator.paginate(qb)
  }

  async getCommentUser(uuid: string) {
    const { user } = await this.commentRepository.findOne(
      { uuid },
      { relations: ['user'] }
    )
    return user
  }

  async getCommentPost(uuid: string) {
    const { post } = await this.commentRepository.findOne(
      { uuid },
      { relations: ['post'] }
    )
    return post
  }

  async getCommentStory(uuid: string) {
    const { story } = await this.commentRepository.findOne(
      { uuid },
      { relations: ['story'] }
    )
    return story
  }

  async findByPost(uuid: string, first: number, after: string) {
    const post = await this.repos.post.findByUuid(uuid)
    if (!post) throw new Error('not-found')
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment."postId" = :postId', { postId: post.id })

    const paginator = this.libs.paginator.getPaginator(Comment, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.ASC,
      first,
      after,
    })
    return await paginator.paginate(qb)
  }

  async create(payload: DeepPartial<Comment>) {
    const connectedEntity = this.connectedEntity(payload)
    let data = payload
    if (connectedEntity) {
      data = {
        ...connectedEntity,
        ...payload,
      }
    }
    const comment = this.commentRepository.create(data)
    return this.commentRepository.save(comment)
  }

  connectedEntity(payload: DeepPartial<Comment>) {
    if (payload.post && payload.post.story) {
      return { story: payload.post.story }
    }
    if (payload.story && payload.story.post) {
      return { post: payload.story.post }
    }
    return false
  }

  async deleteByUuid(uuid: string) {
    return await this.commentRepository.delete({ uuid })
  }

  async updateAndFetch(
    uuid: string,
    payload: DeepPartial<Comment>,
    user: User
  ) {
    const comment = await this.findByUuid(uuid, ['user'])
    if (comment.user.id !== user.id) throw new Error('Unauthorized')
    await this.commentRepository.update(comment.id, {
      content: payload.content,
    })
    return await this.commentRepository.findOneOrFail(comment.id)
  }

  async deleteFromUser(uuid: string, user: User) {
    const comment = await this.findByUuid(uuid, ['user'])
    await this.commentRepository.delete({ uuid })
    return true
  }
}
