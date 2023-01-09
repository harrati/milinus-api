import { Injectable, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard as JwtAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { GqlRequest, GqlRequestWithUser } from '../decorators/user.decorator'
import { UserStatus, UserSubscriptionStatus } from '../modules/user/user.types'

@Injectable()
export class AuthGuard extends JwtAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext<GqlRequest>().req
  }

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context)

    const status = this.reflector.get<string[]>(
      'status',
      context.getHandler()
    ) || [UserStatus.ACTIVE]
    const sponsorship =
      this.reflector.get<string>('sponsorship', context.getHandler()) ||
      UserSubscriptionStatus.FREE

    const ctx = GqlExecutionContext.create(context)
    const { user, admin } = ctx.getContext<GqlRequestWithUser>().req.user

    if (admin || !sponsorship) return true
    if (!user) throw new Error('Unauthorized')
    if (!status.includes(user.status)) throw new Error('Unauthorized')
    if (
      sponsorship === UserSubscriptionStatus.PREMIUM &&
      user.subscriptionStatus !== sponsorship
    )
      throw new Error('subscription')

    return true
  }
}
