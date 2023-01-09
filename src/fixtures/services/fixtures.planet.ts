import { Injectable } from '@nestjs/common'
import { times, random, flatMap, sampleSize, map } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { User } from '../../modules/user/user.entity'
import { System } from '../../modules/system/system.entity'
import { UserPlanet } from '../../modules/planet/userPlanet.entity'
import { Planet } from '../../modules/planet/planet.entity'
import planetsData from '../data/planets.json'

@Injectable()
export class FixturesPlanetService {
  private readonly planetRepository: Repository<Planet>
  private readonly userPlanetRepository: Repository<UserPlanet>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.planetRepository = connection.getRepository(Planet)
    this.userPlanetRepository = connection.getRepository(UserPlanet)
  }

  async injectPlanets(
    systems: System[],
    users: User[]
  ): Promise<{ planets: Planet[]; userPlanets: UserPlanet[] }> {
    console.log('seeding planets...')
    const planets = flatMap(systems, system => {
      return map(planetsData, (planet, index) => {
        return this.planetRepository.create({
          name: planet.name,
          description: planet.description,
          nameEn: planet.nameEn,
          descriptionEn: planet.descriptionEn,
          icon: faker.lorem.word(),
          system,
          initSystemFlag: index === 0,
        })
      })
    })
    await this.planetRepository.save(planets)

    console.log('seeding user/planets relations...')
    const userPlanets = flatMap(users, user => {
      const selectedSystems = sampleSize(systems, random(0, 3))
      const selectedPlanetBySystem = selectedSystems.map(system =>
        planets.filter(planet => planet.system.id === system.id)
      )
      return flatMap(selectedPlanetBySystem, systemPlanets => {
        const numberOfPlanets = random(1, systemPlanets.length)
        return times(numberOfPlanets, index =>
          this.userPlanetRepository.create({
            user,
            planet: systemPlanets[index],
          })
        )
      })
    })
    await this.userPlanetRepository.save(userPlanets)

    return { planets, userPlanets }
  }
}
