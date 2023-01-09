import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { Admin } from './admin.entity'
import {
  AdminsArgs,
  CreateAdminArgs,
  AdminUpdateArgs,
  AdminArgs,
} from './admin.inputs'
import { AdminConnection } from './admin.types'
import { ReposService } from '../repos.service'
import { LibsService } from '../../libs/libs.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard, RolesGuard } from '../../guards'
import { Roles } from '../../decorators/role.decorator'

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => Admin)
export class AdminResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly libs: LibsService
  ) {}

  @Query(() => Admin)
  admin(@Args() args: AdminArgs): Promise<Admin> {
    const { uuid } = args
    return this.repos.admin.findByUuid(uuid)
  }

  @Query(() => AdminConnection)
  admins(@Args() args: AdminsArgs): Promise<AdminConnection> {
    const { where, first, after, before, last } = args
    return this.repos.admin.getAdmins(where, first, last, before, after)
  }

  @Roles('SUPER_ADMIN')
  @Mutation(() => Admin)
  async createAdmin(@Args() args: CreateAdminArgs): Promise<Admin> {
    const admin = await this.repos.admin.createAdmin(args)
    const dynamicLink = this.libs.utils.generatePasswordCreateLink(
      admin.resetPasswordToken
    )
    this.libs.mailjet.send('createPassword', admin, { dynamicLink })
    return admin
  }

  @Roles('SUPER_ADMIN')
  @Mutation(() => Admin)
  updateAdmin(@Args() args: AdminUpdateArgs): Promise<Admin> {
    const { where, data } = args
    return this.repos.admin.updateAdmin(where, data)
  }

  @Roles('SUPER_ADMIN')
  @Mutation(() => Boolean)
  deleteAdmin(@Args() args: AdminArgs): boolean {
    const { uuid } = args
    this.repos.admin.deleteByUuid(uuid)
    return true
  }
}
