import { PageInfo, Aggregate, OrderByDirection } from '../../utils/types'

export type Edge<Entity> = {
  node: Entity
  cursor: string
}

export type PaginatorResult<Entity> = {
  edges: Edge<Entity>[]
  pageInfo: PageInfo
  aggregate: Aggregate
}

export type PaginatorOptions<Entity> = {
  orderBy?: Extract<keyof Entity, string>
  after?: string
  before?: string
  first?: number
  last?: number
  orderByDirection?: OrderByDirection
  alias?: string
}
