import { Injectable, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard as JwtAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { includes } from 'lodash'
import { GqlRequestWithUser, GqlRequest } from '../decorators/user.decorator'

@Injectable()
export class RolesGuard extends JwtAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext<GqlRequest>().req
  }

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context)
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles) return true
    const ctx = GqlExecutionContext.create(context)

    const { admin } = ctx.getContext<GqlRequestWithUser>().req.user
    if (!admin) {
      throw new Error('access-forbidden')
    }

    const { role } = admin
    if (!includes(roles, role)) {
      throw new Error('access-forbidden')
    }

    return true
  }
}
