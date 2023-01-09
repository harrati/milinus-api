import {
  ObjectType,
  Field,
  Int,
  Float,
  InputType,
  registerEnumType,
  ArgsType,
  ID,
} from '@nestjs/graphql'

export type Nullable<T> = T | null
export type Either<T, K> = T | K

@ObjectType('pageInfo')
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage!: boolean

  @Field(() => Boolean)
  hasPreviousPage!: boolean

  @Field({ nullable: true })
  startCursor?: string

  @Field({ nullable: true })
  endCursor?: string
}

@ObjectType('aggregate')
export class Aggregate {
  @Field(() => Int)
  count!: number
}

@ObjectType('coordinate')
export class Coordinate {
  @Field(() => Float)
  longitude: number
  @Field(() => Float)
  latitude: number
}

@InputType('cordinateInput')
export class CoordinateInput {
  @Field(() => Float)
  longitude: number
  @Field(() => Float)
  latitude: number
}

@ArgsType()
export class PageInput {
  @Field(() => ID, { nullable: true })
  after?: string
  @Field(() => Int, { nullable: true })
  first?: number
}

@ArgsType()
export class PageInputAfter {
  @Field(() => Int, { nullable: true })
  after?: number
}
@ArgsType()
export class PageInputFirst {
  @Field(() => Int, { nullable: true })
  first?: number
}

@InputType()
export class WhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class WhereUniqueArgs {
  @Field(() => ID)
  uuid: string
}

export enum OrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
registerEnumType(OrderByDirection, { name: 'OrderByDirection' })

export enum OrderName {
  name = 'name',
  nameEn = 'nameEn',
}
registerEnumType(OrderName, { name: 'OrderName' })

export enum ToggleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
registerEnumType(ToggleStatus, { name: 'ToggleStatus' })
