import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { UserRequest } from './userRequest.entity'
import { User } from '../user/user.entity'

@Injectable()
export class UserRequestLoader {
  constructor(private readonly repos: ReposService) {}

  user() {
    return new DataLoader<UserRequest, User>(async data =>
      Promise.all(
        data.map(async userRequest => {
          return await this.repos.userRequest.loadUser(userRequest)
        })
      )
    )
  }
}
