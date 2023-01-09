import { createParamDecorator } from '@nestjs/common'
import { User } from '../modules/user/user.entity'
import { Admin } from '../modules/admin/admin.entity'
import { ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export interface GqlRequest {
  req: Request
}

export interface RequestWithUser extends Request {
  user: { user: User; admin: Admin }
}

export interface GqlRequestWithUser {
  req: RequestWithUser
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx: GqlExecutionContext = GqlExecutionContext.create(context)
    const ctxWithRequestAndUser: GqlRequestWithUser = ctx.getContext()
    return ctxWithRequestAndUser.req.user && ctxWithRequestAndUser.req.user.user
      ? ctxWithRequestAndUser.req.user.user
      : null
  }
)

export const CurrentAdmin = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx: GqlExecutionContext = GqlExecutionContext.create(context)
    const ctxWithRequestAndUser: GqlRequestWithUser = ctx.getContext()
    return ctxWithRequestAndUser.req.user.admin
  }
)
