import { Injectable } from '@nestjs/common'
import { System } from './system.entity'
import { OrderByDirection } from '../../utils/types'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LibsService } from '../../libs/libs.service'
import { User } from '../user/user.entity'
import { UserProgram } from '../userProgram/userProgram.entity'
import { Program } from '../program/program.entity'
import { Planet } from '../planet/planet.entity'
import { ONE_HUNDRED_PERCENT } from '../../utils/constants'

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(System)
    public readonly systemRepository: Repository<System>,
    private readonly libs: LibsService
  ) {}
  async getSystems(first = 10, after?: string, sort?: OrderByDirection) {
    const qb = this.systemRepository.createQueryBuilder('system')
    if (sort) {
      qb.addSelect(subQuery => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Program, 'program')
          .where('system.id = program."systemId"')
      }, 'count')
        .groupBy('system.id')
        .orderBy('count', sort)
    } else {
      qb.orderBy('system.id', OrderByDirection.DESC)
    }

    const paginator = this.libs.paginator.getPaginator(System, {
      first,
      after,
    })
    const connection = await paginator.manualPaginate(qb)
    return connection
  }

  async findByUuid(uuid: string) {
    return this.systemRepository.findOne({ uuid })
  }

  async getUserSystems(user: User): Promise<Array<System>> {
    return this.systemRepository
      .createQueryBuilder('system')
      .where(qb => {
        const pQuery = qb
          .subQuery()
          .select('p."systemId"')
          .from(Program, 'p')
          .where(qb => {
            const upQuery = qb
              .subQuery()
              .select('up."programId"')
              .from(UserProgram, 'up')
              .where('up."userId" = :userId', {
                userId: user.id,
              })
              .getQuery()
            return 'p."id" IN ' + upQuery
          })
          .getQuery()
        return 'system."id" IN ' + pQuery
      })
      .getMany()
  }

  async getSystemByUserProgram(userProgram: UserProgram): Promise<System> {
    return this.systemRepository
      .createQueryBuilder('system')
      .where(qb => {
        const pQuery = qb
          .subQuery()
          .select('p."systemId"')
          .from(Program, 'p')
          .where(qb => {
            const upQuery = qb
              .subQuery()
              .select('up."programId"')
              .from(UserProgram, 'up')
              .where('up."id" = :id', {
                id: userProgram.id,
              })
              .getQuery()
            return 'p."id" IN ' + upQuery
          })
          .getQuery()
        return 'system."id" IN ' + pQuery
      })
      .leftJoinAndSelect('system.planets', 'planets')
      .getOne()
  }

  async getPlanetsForSystem(system: System): Promise<Array<Planet>> {
    const { planets } = await this.systemRepository.findOneOrFail(system.id, {
      relations: ['planets'],
    })
    return planets
  }

  async getProgramsForSystem(system: System): Promise<Program[]> {
    const { programs } = await this.systemRepository.findOneOrFail(system.id, {
      relations: ['programs'],
    })
    return programs
  }

  async findPlanetInSystemToUnlock(
    userProgram: UserProgram,
    progress: number
  ): Promise<Planet> {
    const system: System = await this.getSystemByUserProgram(userProgram)
    const numberOfPlanets: number = system.planets.length
    const onePlanet = ONE_HUNDRED_PERCENT / numberOfPlanets
    const planetToOpen = Math.floor(progress / onePlanet)
    const indexOfPlanetToOpen = planetToOpen - 1
    const planet: Planet = system.planets[indexOfPlanetToOpen]
    return planet
  }
}
