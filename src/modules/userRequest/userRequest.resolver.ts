import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard, RolesGuard } from '../../guards'
import { RequestCategory, RequestStatus, UserRequestConnection } from './userRequest.types'
import { UserRequest } from './userRequest.entity'
import { Roles } from '../../decorators/role.decorator'
import { User } from '../user/user.entity'
import { UserRequestLoader } from './userRequest.loader'
import { CreateUserRequestArgs, UserRequestArgs } from './userRequest.inputs'
import { CurrentUser } from '../../decorators'
import { DeepPartial } from 'typeorm'
import { UserStatus } from '../user/user.types'

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => UserRequest)
export class UserRequestResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: UserRequestLoader
  ) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Query(() => UserRequestConnection)
  requests(@Args() args: UserRequestArgs): Promise<UserRequestConnection> {
    const { first, after, where } = args
    return this.repos.userRequest.getRequests(where, first, after)
  }

  @ResolveField('user', () => User)
  user(@Parent() userRequest: UserRequest): Promise<User> {
    return this.loader.user().load(userRequest)
  }

  @Mutation(() => UserRequest)
  async createUserRequest(
    @CurrentUser() user: User,
    @Args() args: CreateUserRequestArgs
  ): Promise<DeepPartial<UserRequest>> {
    const payload = {
      ...args,
      user,
      status: RequestStatus.PROCESSED,
    }
    const userRequest = await this.repos.userRequest.createUserRequest(
      user,
      payload
    )

    if (userRequest.category === RequestCategory.DATA_REQUEST) {
      await this.repos.userRequest.processRequest(userRequest)
    }

    if (userRequest.category === RequestCategory.DELETE) {
      await this.repos.user.updateUserStatus(user, UserStatus.DELETED)
    }

    return userRequest
  }
}
