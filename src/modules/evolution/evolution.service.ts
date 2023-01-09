import { Injectable } from '@nestjs/common'
import { Evolution } from './evolution.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeepPartial } from 'typeorm'
import { CreateEvolutionArgs } from './evolution.inputs'
import { OrderByDirection } from '../../utils/types'
import { LibsService } from '../../libs/libs.service'
import { User } from '../user/user.entity'
import { PaginatorResult } from '../../libs/paginator/paginator.types'

type EvolutionFilters = {
  start: Date
  end: Date
}

@Injectable()
export class EvolutionService {
  constructor(
    @InjectRepository(Evolution)
    public readonly evolutionRepository: Repository<Evolution>,
    private readonly libs: LibsService
  ) {}

  getEvolutionsByUuid(uuid: string): Promise<Evolution> {
    return this.evolutionRepository.findOne({ uuid })
  }

  getEvolutionTotalCount(user: User): Promise<number> {
    return this.evolutionRepository
      .createQueryBuilder('evolution')
      .andWhere('evolution."userId" = :userId', { userId: user.id })
      .getCount()
  }

  async getEvolutionsData(
    filters: EvolutionFilters,
    user: User
  ): Promise<number[]> {
    const totalCount = await this.getEvolutionTotalCount(user)
    if (totalCount === 0) return [user.currentWeight, user.wantedWeight]

    const [evolutions, count] = await this.evolutionRepository
      .createQueryBuilder('evolution')
      .andWhere('evolution."userId" = :userId', { userId: user.id })
      .andWhere('evolution."createdAt" >= :start')
      .andWhere('evolution."createdAt" < :end')
      .setParameters(filters)
      .select('evolution.weight')
      .orderBy('id', OrderByDirection.ASC)
      .getManyAndCount()

    if (count > 0) return evolutions.map(({ weight }) => weight)

    const { weight } = await this.evolutionRepository
      .createQueryBuilder('evolution')
      .andWhere('evolution."userId" = :userId', { userId: user.id })
      .andWhere('evolution."createdAt" <= :start')
      .setParameters(filters)
      .select('evolution.weight')
      .getOne()
    return [weight, weight]
  }

  getEvolutionsForUser(
    filters: EvolutionFilters,
    user: User,
    first = 10,
    after?: string
  ): Promise<PaginatorResult<Evolution>> {
    const qb = this.evolutionRepository.createQueryBuilder('evolution')
    qb.andWhere('evolution."userId" = :userId', { userId: user.id })
      .andWhere('evolution."createdAt" >= :start')
      .andWhere('evolution."createdAt" < :end')
      .setParameters(filters)

    const paginator = this.libs.paginator.getPaginator(Evolution, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.DESC,
      first,
      after,
    })
    return paginator.paginate(qb)
  }

  createEvolution(
    evolutionPayload: DeepPartial<CreateEvolutionArgs>
  ): Promise<Evolution> {
    const evolution = this.evolutionRepository.create(evolutionPayload)
    return this.evolutionRepository.save(evolution)
  }

  async getWatermarkPictureUrlForEvolution(
    evolution: Evolution
  ): Promise<string> {
    if (evolution.watermarkedPictureUrl) return evolution.watermarkedPictureUrl
    if (evolution.pictureUrl) return null

    const { pictureUrl } = evolution
    const watermarkedImagePath = await this.libs.image.watermark(pictureUrl)
    const watermarkedImageUploadedPath = await this.libs.firebase.uploadFileFromPath(
      watermarkedImagePath,
      'image'
    )

    await this.evolutionRepository.update(
      { uuid: evolution.uuid },
      { watermarkedPictureUrl: watermarkedImageUploadedPath }
    )

    return watermarkedImageUploadedPath
  }

  async getBoundary(
    user: User,
    orderByDirection: 'ASC' | 'DESC'
  ): Promise<number> {
    const { weight } = await this.evolutionRepository
      .createQueryBuilder('evolution')
      .andWhere('evolution."userId" = :userId', { userId: user.id })
      .orderBy('evolution.weight', orderByDirection)
      .getOne()
    return weight
  }
  async getEvolutionBoundaries(user: User): Promise<[number, number]> {
    if (!user.currentWeight || !user.wantedWeight) return null
    const totalCount = await this.getEvolutionTotalCount(user)
    if (totalCount < 2) return [user.currentWeight, user.wantedWeight]

    const minBoundary = await this.getBoundary(user, 'ASC')
    const maxBoundary = await this.getBoundary(user, 'DESC')

    return [minBoundary, maxBoundary]
  }
}
