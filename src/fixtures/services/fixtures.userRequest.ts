import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { LibsService } from '../../libs/libs.service'
import { UserRequest } from '../../modules/userRequest/userRequest.entity'
import { User } from '../../modules/user/user.entity'
import { RequestCategory } from '../../modules/userRequest/userRequest.types'
import { sample } from 'lodash'

@Injectable()
export class FixturesUserRequestService {
  private readonly repository: Repository<UserRequest>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.repository = connection.getRepository(UserRequest)
  }

  async injectUserRequests(users: User[]): Promise<UserRequest[]> {
    console.log('seeding userRequest...')
    const userRequests = users.map(user =>
      this.repository.create({ user, category: sample(RequestCategory) })
    )
    return this.repository.save(userRequests)
  }
}
