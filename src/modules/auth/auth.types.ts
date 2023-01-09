import { ObjectType, Field } from '@nestjs/graphql'
import { User } from '../user/user.entity'
import { Admin } from '../admin/admin.entity'

@ObjectType()
export class UserSignIn {
  @Field(() => User)
  user: User
  @Field()
  token: string
}

@ObjectType()
export class AdminSignIn {
  @Field(() => Admin)
  admin: Admin
  @Field()
  token: string
}
