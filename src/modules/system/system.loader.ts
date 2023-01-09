import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { System } from '../system/system.entity'
import { first } from 'lodash'

@Injectable()
export class SystemLoader {
  constructor(private readonly repos: ReposService) {}

  countUsage() {
    return new DataLoader<System, number>(async data =>
      Promise.all(
        data.map(async system => {
          const programs = await this.repos.system.getProgramsForSystem(system)
          return programs.length
        })
      )
    )
  }

  systemName() {
    return new DataLoader<System, string>(async data =>
      Promise.all(
        data.map(async system => {
          const programs = await this.repos.system.getProgramsForSystem(system)
          const program = first(programs)
          return program ? program.name : system.name
        })
      )
    )
  }
}
