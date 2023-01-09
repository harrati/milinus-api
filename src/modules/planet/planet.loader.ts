import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { Planet } from './planet.entity'
import { System } from '../system/system.entity'

@Injectable()
export class PlanetLoader {
  constructor(private readonly repos: ReposService) {}

  planets() {
    return new DataLoader<System, Planet[]>(async data =>
      Promise.all(
        data.map(async system => {
          const planets = await this.repos.system.getPlanetsForSystem(system)
          return planets
        })
      )
    )
  }

  // countUsage() {
  //   return new DataLoader<System, number>(async data =>
  //     Promise.all(
  //       data.map(async system => {
  //         const programs = await this.repos.system.getProgramsForSystem(system)
  //         return programs.length
  //       })
  //     )
  //   )
  // }
}
