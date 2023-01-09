import { registerEnumType, ObjectType, Field, ID } from '@nestjs/graphql'
import { Admin } from './admin.entity'
import { Aggregate, PageInfo } from '../../utils/types'

export enum AdminRoles {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
registerEnumType(AdminRoles, { name: 'AdminRoles' })

@ObjectType()
export class AdminEdge {
  @Field(() => Admin)
  node: Admin
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class AdminConnection {
  @Field(() => [AdminEdge])
  edges: AdminEdge[]

  @Field(() => Aggregate)
  aggregate: Aggregate

  @Field(() => PageInfo)
  pageInfo: PageInfo
}
