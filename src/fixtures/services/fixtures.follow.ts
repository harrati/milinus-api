import { Injectable } from '@nestjs/common'
import { times, uniqWith, compact, flatten, isEqual } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { LibsService } from '../../libs/libs.service'
import { Follow } from '../../modules/follow/follow.entity'
import { User } from '../../modules/user/user.entity'

@Injectable()
export class FixturesFollowService {
  private readonly repository: Repository<Follow>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.repository = connection.getRepository(Follow)
  }

  async injectFollows(users: User[]): Promise<Follow[]> {
    console.log('seeding follows...')
    const follows = users.map(user => {
      const follow = times(10, i => {
        if (users[i] === user) return null
        return this.repository.create({
          follower: user,
          following: users[i],
        })
      })
      return follow
    })
    const parsedFollows = uniqWith(compact(flatten(follows)), isEqual)
    return await this.repository.save(parsedFollows)
  }
}
