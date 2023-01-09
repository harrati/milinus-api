import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LibsService } from '../../libs/libs.service'
import { Follow } from './follow.entity'
import { OrderByDirection } from '../../utils/types'
import { FollowWhereInput } from './follow.inputs'
import { ReposService } from '../repos.service'
import { map } from 'lodash'
import { User } from '../user/user.entity'
import { UserStatus } from '../user/user.types'

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    public readonly followRepository: Repository<Follow>,
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService,
    private readonly libs: LibsService
  ) {}

  async getFollowers(
    first = 10,
    userUuid: string,
    where?: FollowWhereInput,
    after?: string
  ) {
    const user = await this.repos.user.findByUuid(userUuid)
    const qb = this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'user')
      .where('follow."followingId" = :userId', { userId: user.id })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })

    if (where && where.search) {
      qb.andWhere('LOWER("user"."userName") LIKE :search', {
        search: `%${where.search.toLowerCase()}%`,
      })
    }

    const paginator = this.libs.paginator.getPaginator(Follow, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.ASC,
      first,
      after,
    })

    const connection = await paginator.paginate(qb)
    return {
      ...connection,
      edges: map(connection.edges, edge => {
        return {
          cursor: edge.cursor,
          node: edge.node.follower,
        }
      }),
    }
  }

  async getFollowingIds(user: User): Promise<string[]> {
    const results = await this.followRepository
      .createQueryBuilder('follow')
      .where('follow."followerId" = :userId', { userId: user.id })
      .leftJoinAndSelect('follow.following', 'user')
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getMany()

    return map(results, 'following.id')
  }

  async getFollowings(
    first = 10,
    userUuid: string,
    where?: FollowWhereInput,
    after?: string
  ) {
    const user = await this.repos.user.findByUuid(userUuid)
    const qb = this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'user')
      .where('follow."followerId" = :userId', { userId: user.id })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })

    if (where && where.search) {
      qb.andWhere('LOWER("user"."userName") LIKE :search', {
        search: `%${where.search.toLowerCase()}%`,
      })
    }

    const paginator = this.libs.paginator.getPaginator(Follow, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.ASC,
      first,
      after,
    })

    const connection = await paginator.paginate(qb)
    return {
      ...connection,
      edges: map(connection.edges, edge => {
        return {
          cursor: edge.cursor,
          node: edge.node.following,
        }
      }),
    }
  }

  async getFollowersCount(user: User) {
    return this.followRepository
      .createQueryBuilder('follow')
      .where('follow."followingId" = :userId', { userId: user.id })
      .leftJoin('follow.follower', 'user')
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount()
  }

  async getFollowingsCount(user: User) {
    return this.followRepository
      .createQueryBuilder('follow')
      .where('follow."followerId" = :userId', { userId: user.id })
      .leftJoin('follow.following', 'user')
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount()
  }

  async isFollowing(current: User, user: User) {
    const follow = await this.followRepository
      .createQueryBuilder('follow')
      .where('follow."followerId" = :followerId', { followerId: current.id })
      .andWhere('follow."followingId" = :followingId', { followingId: user.id })
      .getOne()

    return !!follow
  }

  async createFollowing(current: User, user: User) {
    const followingPayload = {
      follower: current,
      following: user,
    }
    const following = this.followRepository.create(
      followingPayload as DeepPartial<Follow>
    )
    return await this.followRepository.save(following)
  }

  async deleteFollowing(current: User, user: User) {
    return await this.followRepository.delete({
      follower: current,
      following: user,
    })
  }
}
