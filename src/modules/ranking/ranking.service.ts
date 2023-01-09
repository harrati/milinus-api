import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { RankingWhereInput } from './ranking.inputs'
import { RankingEdge, RankingConnection } from './ranking.types'
import { ReposService } from '../repos.service'
import { LibsService } from '../../libs/libs.service'
import { map, findIndex, head, last, filter } from 'lodash'
import { User } from '../user/user.entity'
import { ObjectLiteral } from 'typeorm'
import { UserStatus } from '../user/user.types'

const removePrefix = (key: string, prefix: string) =>
  key.replace(`${prefix}_`, '')

@Injectable()
export class RankingService {
  constructor(
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService,
    public readonly libs: LibsService
  ) {}

  async getRanking(
    where?: RankingWhereInput,
    first = 20,
    after?: string
  ): Promise<RankingConnection> {
    const lastCursor = after
      ? await this.repos.user.userRepository.findOne({ uuid: after })
      : null
    if (after && !lastCursor) throw new Error('pagination')

    let results = await this.repos.user.userRepository
      .createQueryBuilder('user')
      .addSelect('SUM(tr.points)', 'points')
      .leftJoin('user.trainingReports', 'tr')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .groupBy('user.id')
      .orderBy('points', 'DESC', 'NULLS LAST')
      .getRawMany()

    let rankingEdges: RankingEdge[] = map(results, (e, i, _) => {
      const user = Object.keys(e).reduce((result: ObjectLiteral, key) => {
        if (!key.includes('user')) return result
        const newName = removePrefix(key, 'user')
        result[newName] = e[key]
        return result
      }, {})

      return {
        node: {
          user: user as User,
          position: i + 1,
          points: e.points || 0,
        },
        // @ts-ignore
        cursor: user.uuid,
      }
    })

    if (where && where.search) {
      rankingEdges = filter(rankingEdges, ({ node: { user } }) => {
        return user.userName.toLowerCase().includes(where.search.toLowerCase())
      })
    }

    rankingEdges = rankingEdges.filter((elt, i) => i < 100)
    results = results.filter((elt, i) => i < 100)

    const cursorIndex = after
      ? findIndex(rankingEdges, edge => edge.cursor === after) + 1
      : 0

    const limit =
      cursorIndex + first < results.length
        ? cursorIndex + first
        : results.length

    const page = rankingEdges.slice(cursorIndex, limit + 1)

    const firstItem = head(page)
    const lastItem = last(page)

    return {
      pageInfo: {
        hasNextPage: !!results[limit],
        hasPreviousPage: !!after,
        endCursor: lastItem ? lastItem.cursor : null,
        startCursor: firstItem ? firstItem.cursor : null,
      },
      edges: page,
      aggregate: {
        count: results.length,
      },
    }
  }
}
