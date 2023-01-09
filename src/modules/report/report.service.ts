import { Injectable } from '@nestjs/common'
import { Report } from './report.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeepPartial } from 'typeorm'
import { LibsService } from '../../libs/libs.service'
import { Story } from '../story/story.entity'
import { Comment } from '../comment/comment.entity'
import { User } from '../user/user.entity'
import { OrderByDirection, WhereUniqueInput } from '../../utils/types'
import { ReportWhereInput } from './report.inputs'
import { ERR_DUP_ENTRY } from '../../utils/constants'
import { Post } from '../post/post.entity'

export type SortOptions = 'id' | 'category' | 'status' | 'createdAt' | 'name'
@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    public readonly reportRepository: Repository<Report>,
    private readonly libs: LibsService
  ) { }

  findByUuid(uuid: string): Promise<Report> {
    return this.reportRepository.findOne({ uuid })
  }

  async getReportStory(uuid: string): Promise<Story> {
    const { story } = await this.reportRepository.findOne(
      { uuid },
      { relations: ['story'] }
    )
    return story
  }
  async getReporWithRelations(uuid: string) {
    return await this.reportRepository.findOne(
      { uuid },
      { relations: ['story', 'comment', 'user', 'post'] }
    )
  }

  async getReportComment(uuid: string): Promise<Comment> {
    const { comment } = await this.reportRepository.findOne(
      { uuid },
      { relations: ['comment'] }
    )
    return comment
  }

  async getReportUser(uuid: string): Promise<User> {
    const { user } = await this.reportRepository.findOne(
      { uuid },
      { relations: ['user'] }
    )
    return user
  }

  async getReportPost(uuid: string): Promise<Post> {
    const { post } = await this.reportRepository.findOne(
      { uuid },
      { relations: ['post'] }
    )
    return post
  }

  async createReport(reportPayload: DeepPartial<Report>): Promise<Report> {
    try {
      const report = this.reportRepository.create(reportPayload)
      return await this.reportRepository.save(report)
    } catch (error) {
      if (error.code === ERR_DUP_ENTRY) {
        throw new Error('already-exist')
      }
    }
  }

  async updateReport(
    report: WhereUniqueInput,
    payload: DeepPartial<Report>
  ): Promise<Report> {
    await this.reportRepository.update(
      { uuid: report.uuid },
      { ...(payload as DeepPartial<Report>) }
    )
    const updatedReport = await this.reportRepository.findOneOrFail({
      uuid: report.uuid,
    })
    return updatedReport
  }

  async getReports(
    filters?: ReportWhereInput,
    first = 10,
    after?: string,
    last?: number,
    before?: string,
    sort?: SortOptions,
    order = OrderByDirection.ASC
  ) {
    const qb = this.reportRepository.createQueryBuilder('report')

    if (filters && filters.status) {
      qb.andWhere('report.status = :status', {
        status: filters.status,
      })
    }

    if (filters && filters.category) {
      qb.andWhere('report.category = :category', {
        category: filters.category,
      })
    }

    if (sort) {
      if (sort !== 'name') qb.orderBy(`report."${sort}"`, order)
      else {
        qb.leftJoin('report.story', 'story')
          .leftJoin('report.comment', 'comment')
          .leftJoin('report.post', 'post')
          .leftJoin('comment.user', 'uc')
          .leftJoin('report.user', 'user')
          .orderBy('user.firstName', order)
      }
    }

    const paginator = this.libs.paginator.getPaginator(Report, {
      first,
      after,
      last,
      before,
    })
    const connection = await paginator.manualPaginate(qb)
    return connection
  }

  async countReportsByUser(user: User) {
    const qb = await this.reportRepository
      .createQueryBuilder('report')
      .where('report."userId" = :userId', { userId: user.id })
      .getCount()
    return qb
  }
}
