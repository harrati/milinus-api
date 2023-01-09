import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { DeepPartial } from 'typeorm'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { Exercise } from '../exercise/exercise.entity'
import { Nullable } from '../../utils/types'
import { User } from '../user/user.entity'

@Injectable()
export class GroupExerciseLoader {
  constructor(private readonly repos: ReposService) {}

  exercise() {
    return new DataLoader<GroupExercise, DeepPartial<Exercise>>(async data =>
      Promise.all(
        data.map(async groupExercise => {
          const exercise = await this.repos.groupExercise.getExercise(
            groupExercise
          )
          return exercise
        })
      )
    )
  }
  weight() {
    return new DataLoader<
      { groupExercise: GroupExercise; user: User },
      Nullable<number>
    >(async data =>
      Promise.all(
        data.map(async ({ groupExercise, user }) => {
          const exercise = await this.repos.groupExercise.getExerciseWeight(
            groupExercise,
            user
          )
          return exercise
        })
      )
    )
  }
}
