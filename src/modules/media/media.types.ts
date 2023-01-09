import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  InputType,
} from '@nestjs/graphql'
import { Aggregate, PageInfo } from '../../utils/types'
import { Media } from './media.entity'

@ObjectType()
export class MediaEdge {
  @Field(() => Media)
  node: Media
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class MediaConnection {
  @Field(() => [MediaEdge])
  edges: MediaEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}
export enum MediaTypes {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
registerEnumType(MediaTypes, { name: 'MediaTypes' })

@InputType()
export class MediaInput {
  @Field(() => String)
  url: string
  @Field(() => MediaTypes)
  type: MediaTypes
  @Field(() => Boolean, { nullable: true })
  mute: boolean
}
