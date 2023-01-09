import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { Group } from '../group/group.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'

@Injectable()
export class GroupLoader {
  constructor(private readonly repos: ReposService) {}

  groupExercices() {
    return new DataLoader<Group, DeepPartial<GroupExercise>[]>(async data =>
      Promise.all(
        data.map(async group => {
          const groups = await this.repos.groupExercise.getGroupExercises(group)
          return groups
        })
      )
    )
  }
}
