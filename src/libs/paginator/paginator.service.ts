import { Injectable } from '@nestjs/common'
import { SelectQueryBuilder, ObjectType } from 'typeorm'
import { PaginatorResult, PaginatorOptions, Edge } from './paginator.types'
import { Nullable, OrderByDirection } from '../../utils/types'
import { findIndex, last, head } from 'lodash'

type ManualProperty = {
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: Nullable<string>
  endCursor: Nullable<string>
}

class Paginator<Entity> {
  private totalCount: number
  private hasNextPage: boolean
  private hasPreviousPage: boolean
  private startCursor: Nullable<string>
  private endCursor: Nullable<string>

  public constructor(
    private entity: ObjectType<Entity>,
    private alias: string,
    private after: Nullable<string>,
    private before: Nullable<string>,
    private first: Nullable<number>,
    private last: number,
    private orderBy: Extract<keyof Entity, string>,
    private orderByDirection: OrderByDirection
  ) {
    this.totalCount = 0
    this.hasNextPage = false
    this.hasPreviousPage = false
  }

  public setManualProperty({
    totalCount = 0,
    hasNextPage = false,
    hasPreviousPage,
    startCursor,
    endCursor,
  }: ManualProperty) {
    this.totalCount = totalCount
    this.hasNextPage = hasNextPage
    this.hasPreviousPage = hasPreviousPage
    this.startCursor = startCursor
    this.endCursor = endCursor
  }

  public async paginate(
    builder: SelectQueryBuilder<Entity>
  ): Promise<PaginatorResult<Entity>> {
    await this.setTotalCount(builder)
    this.setBuilderPagination(builder)
    const results = await this.getResults(builder)
    const edges = this.getEdges(results)
    await this.setPageInfo(edges)
    const connection = this.getConnection(edges)
    return connection
  }

  public async setTotalCount(builder: SelectQueryBuilder<Entity>) {
    const totalCount = await builder.getCount()
    this.totalCount = totalCount
  }

  public setBuilderPagination(builder: SelectQueryBuilder<Entity>) {
    const cursor = this.getCurrentCursor()
    if (cursor) {
      const [key, value, id] = this.decode(cursor)
      const operator = this.getOperator(true)
      builder.andWhere(`${this.alias}.${key} ${operator} :value`, { value })
    }
    const limit = this.getLimit()
    if (this.orderBy === 'name') {
      builder.orderBy(
        `upper(${this.alias}.${this.orderBy})`,
        this.orderByDirection
      )
    } else {
      builder.orderBy(`${this.alias}.${this.orderBy}`, this.orderByDirection)
    }

    if (limit) {
      builder.take(limit + 1)
    }
  }

  public async setPageInfo(edges: Edge<Entity>[]) {
    const limit = this.getLimit()
    const paginatedCount = edges.length
    const id = this.formatId(this.getId())
    const lastIndex = !limit
      ? edges.length
      : paginatedCount === limit + 1
      ? paginatedCount - 2
      : paginatedCount - 1
    this.hasNextPage = limit ? paginatedCount === limit + 1 : false
    this.hasPreviousPage = limit ? id > 0 : false
    this.startCursor = paginatedCount > 0 ? edges[0].cursor : null
    this.endCursor =
      paginatedCount > 0 ? edges[lastIndex] && edges[lastIndex].cursor : null
  }

  public getCurrentCursor() {
    return this.after || this.before || null
  }

  public getResults(builder: SelectQueryBuilder<Entity>) {
    return builder.getMany()
  }

  public getEdges(results: Entity[], encode = true): Edge<Entity>[] {
    return results.map(node => {
      // @ts-ignore
      let cursor = node ? node.uuid : null

      if (encode) {
        // @ts-ignore
        cursor = this.encode(this.orderBy, node[this.orderBy], node.id)
      }
      return {
        node,
        cursor,
      }
    })
  }

  public getConnection(edges: Edge<Entity>[]) {
    const limit = this.getLimit()
    const connection: PaginatorResult<Entity> = {
      pageInfo: {
        hasNextPage: this.hasNextPage,
        hasPreviousPage: this.hasPreviousPage,
        endCursor: this.endCursor || undefined,
        startCursor: this.startCursor || undefined,
      },
      aggregate: {
        count: this.totalCount,
      },
      edges: !limit
        ? edges
        : edges.length === limit + 1
        ? edges.slice(0, edges.length - 1)
        : edges,
    }
    return connection
  }

  public formatId(id: number) {
    if (this.after || this.orderByDirection === OrderByDirection.DESC) return id
    return id - this.getLimit() - 1
  }

  public getId() {
    const cursor = this.getCurrentCursor()
    if (!cursor) return 1
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [key, value, id] = this.decode(cursor)
    return id
  }

  public getOperator(strict = false) {
    const suffix = strict ? '' : '='
    if (this.after)
      return this.orderByDirection === OrderByDirection.ASC
        ? `>${suffix}`
        : `<${suffix}`
    return this.orderByDirection === OrderByDirection.ASC
      ? `<${suffix}`
      : `>${suffix}`
  }

  public getLimit() {
    return this.before ? this.last : this.first
  }

  public decode(cursor: string): [string, any, number] {
    const [key, value, type, id] = Buffer.from(cursor, 'base64')
      .toString()
      .split(':')
    const decodedValue =
      type === 'date'
        ? new Date(parseInt(value, 10))
        : type === 'number'
        ? parseInt(value, 10)
        : type === 'string'
        ? decodeURIComponent(value)
        : null
    if (!decodedValue) throw new Error('cursor')
    const parsedId = parseInt(id, 10)
    return [key, decodedValue, parsedId]
  }

  public encode(key: string, value: any, id: number) {
    const type = Reflect.getOwnMetadata(
      'design:type',
      this.entity.prototype,
      key
    ).name.toLowerCase()

    const encodedValue =
      type === 'date'
        ? (value as Date).getTime().toString()
        : type === 'number'
        ? (value as number).toString()
        : type === 'string'
        ? encodeURIComponent(value)
        : null
    if (!encodedValue) throw new Error('cursor')
    return Buffer.from(
      `${key}:${encodedValue}:${type}:${id.toString()}`
    ).toString('base64')
  }

  public async manualPaginate(
    builder: SelectQueryBuilder<Entity>,
    entityArray?: Entity[]
  ): Promise<PaginatorResult<Entity>> {
    const entities = entityArray ? entityArray : await builder.getMany()

    let cursorIndex = 0
    if (this.after) {
      // @ts-ignore
      cursorIndex = findIndex(entities, { uuid: this.after })
    }

    if (this.before) {
      // @ts-ignore
      cursorIndex = findIndex(entities, { uuid: this.before }) - this.last
    }

    let limit =
      entities.length > cursorIndex + this.first + 3
        ? cursorIndex + this.first
        : entities.length

    if (this.before) {
      limit =
        entities.length > cursorIndex + this.last + 3
          ? cursorIndex + this.last
          : entities.length
    }

    const page = entities.slice(cursorIndex, limit + 1)

    const firstItem = head(page)
    const lastItem = last(page)

    this.setManualProperty({
      totalCount: entities.length,
      hasNextPage: !!entities[limit],
      hasPreviousPage: !!this.after,
      // @ts-ignore
      endCursor: lastItem ? lastItem.uuid : null,
      // @ts-ignore
      startCursor: firstItem ? firstItem.uuid : null,
    })
    const edges = this.getEdges(page, false)
    return this.getConnection(edges)
  }
}

@Injectable()
export class PaginatorService {
  public getPaginator<Entity>(
    entity: ObjectType<Entity>,
    options?: PaginatorOptions<Entity>
  ): Paginator<Entity> {
    const {
      after,
      before,
      first,
      last,
      orderBy,
      orderByDirection,
      alias,
    } = options
    if (after && before) throw new Error('pagination')

    return new Paginator<Entity>(
      entity,
      alias || entity.name.toLowerCase(),
      after || null,
      before || null,
      first,
      last || 10,
      orderBy,
      orderByDirection || OrderByDirection.DESC
    )
  }
}
