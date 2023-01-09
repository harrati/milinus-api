import { Injectable, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard as JwtAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { intersection } from 'lodash'
import { GqlRequestWithUser, GqlRequest } from '../decorators/user.decorator'

@Injectable()
export class ProtectedParamsGuard extends JwtAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext<GqlRequest>().req
  }

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context)

    const params = this.reflector.get<string[]>('params', context.getHandler())
    const ctx = GqlExecutionContext.create(context)

    const { where } = ctx.getArgs()
    const { admin } = ctx.getContext<GqlRequestWithUser>().req.user

    if (!params || !where || admin) return true

    const requestedParams = Object.keys(where)
    if (intersection(params, requestedParams).length !== 0) {
      throw new Error('Unauthorized')
    }

    return true
  }
}
