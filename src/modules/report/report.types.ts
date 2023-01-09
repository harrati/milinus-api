import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { Report } from './report.entity'
import { Aggregate, PageInfo } from '../../utils/types'

@ObjectType()
export class ReportEdge {
  @Field(() => Report)
  node: Report
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class ReportConnection {
  @Field(() => [ReportEdge])
  edges: ReportEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}

export enum ReportActions {
  BAN = 'BAN',
  ALLOW = 'ALLOW',
  DELETE = 'DELETE',
}
registerEnumType(ReportActions, { name: 'ReportActions' })

export enum ReportSort {
  ID = 'id',
  NAME = 'name',
  STATUS = 'status',
  CATEGORY = 'category',
  CREATED_AT = 'createdAt',
}
registerEnumType(ReportSort, { name: 'ReportSort' })

export enum ReportStatus {
  TREATED = 'TREATED',
  UNTREATED = 'UNTREATED',
}
registerEnumType(ReportStatus, { name: 'ReportStatus' })

export enum ReportCategories {
  STORY = 'STORY',
  COMMENT = 'COMMENT',
  POST = 'POST',
}
registerEnumType(ReportCategories, { name: 'ReportCategories' })
