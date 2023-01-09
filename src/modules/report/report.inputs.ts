import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql'
import {
  ReportCategories,
  ReportStatus,
  ReportActions,
  ReportSort,
} from './report.types'
import { OrderByDirection } from '../../utils/types'

@InputType()
export class ReportWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class ReportUpdateInput {
  @Field(() => ReportActions)
  action: ReportActions
}

@InputType()
export class ReportWhereInput {
  @Field(() => ReportCategories, { nullable: true })
  category?: ReportCategories
  @Field(() => ReportStatus, { nullable: true })
  status?: ReportStatus
}

@InputType()
export class CreateReportWhereInput {
  @Field(() => ID, { nullable: true })
  storyUuid?: string
  @Field(() => ID, { nullable: true })
  postUuid?: string
  @Field(() => ID, { nullable: true })
  commentUuid?: string
}

@ArgsType()
export class ReportArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class ReportsArgs {
  @Field(() => ReportWhereInput)
  where?: ReportWhereInput
  @Field(() => Int, { nullable: true })
  first?: number
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  last?: number
  @Field(() => ID, { nullable: true })
  before?: string
  @Field(() => ReportSort, { nullable: true })
  sort?: ReportSort
  @Field(() => OrderByDirection, { nullable: true })
  order?: OrderByDirection
}

@ArgsType()
export class ProcessReportArgs {
  @Field(() => ReportWhereUniqueInput)
  where: ReportWhereUniqueInput
  @Field(() => ReportUpdateInput)
  data: ReportUpdateInput
}

@ArgsType()
export class CreateReportArgs {
  @Field(() => CreateReportWhereInput)
  where: CreateReportWhereInput
}
