import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Planet } from './planet.entity'
import { Repository } from 'typeorm'
import { User } from '../user/user.entity'
import { UserPlanet } from './userPlanet.entity'

@Injectable()
export class PlanetService {
  constructor(
    @InjectRepository(Planet)
    public readonly planetRepository: Repository<Planet>,
    @InjectRepository(UserPlanet)
    public readonly userPlanetRepository: Repository<UserPlanet>
  ) {}

  async createUserPlanet(user: User, planet: Planet) {
    if (!planet) return

    const userPlanet = await this.userPlanetRepository.findOne({ planet, user })
    if (userPlanet) return

    const userPlanetCreated = this.userPlanetRepository.create({
      user,
      planet,
    })
    this.userPlanetRepository.save(userPlanetCreated)
  }

  async getUserPlanet(user: User, planet: Planet): Promise<UserPlanet> {
    const userPlanet = await this.userPlanetRepository.findOne({ planet, user })
    return userPlanet
  }
}
