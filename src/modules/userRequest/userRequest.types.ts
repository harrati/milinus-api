import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { PageInfo, Aggregate } from '../../utils/types'
import { UserRequest } from './userRequest.entity'

@ObjectType()
class UserRequestEdge {
  @Field(() => UserRequest)
  node!: UserRequest

  @Field(() => ID)
  cursor!: string
}

@ObjectType()
export class UserRequestConnection {
  @Field(() => PageInfo)
  pageInfo!: PageInfo

  @Field(() => Aggregate)
  aggregate!: Aggregate

  @Field(() => [UserRequestEdge])
  edges!: UserRequestEdge[]
}

export enum RequestStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}
registerEnumType(RequestStatus, { name: 'RequestStatus' })

export enum RequestCategory {
  DELETE = 'DELETE',
  DATA_REQUEST = 'DATA_REQUEST',
}
registerEnumType(RequestCategory, { name: 'RequestCategory' })
