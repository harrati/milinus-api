import Aigle from 'aigle'
import DataLoader from 'dataloader'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { User } from './user.entity'
import { ChartWeightBoundaries } from './user.types'
import { System } from '../system/system.entity'
import { Program } from '../program/program.entity'

type isFollowing = {
  current: User
  user: User
}

@Injectable()
export class UserLoader {
  constructor(private readonly repos: ReposService) {}

  chartWeightBoundaries() {
    return new DataLoader<User, ChartWeightBoundaries>(async data =>
      Promise.all(
        data.map(async user => {
          const boundaries = await this.repos.evolution.getEvolutionBoundaries(
            user
          )
          if (!boundaries) return null
          const [min, max] = boundaries
          return { min, max }
        })
      )
    )
  }

  system() {
    return new DataLoader<User, System>(async data =>
      Promise.all(
        data.map(async user => {
          const userProgram = await this.repos.userProgram.getCurrent(user)
          if (!userProgram) return null
          return await this.repos.system.getSystemByUserProgram(userProgram)
        })
      )
    )
  }

  program() {
    return new DataLoader<User, Program>(async data =>
      Promise.all(
        data.map(async user => {
          const userProgram = await this.repos.userProgram.getCurrent(user)
          if (!userProgram) return null
          return await this.repos.userProgram.loadProgram(userProgram)
        })
      )
    )
  }

  followersCount() {
    return new DataLoader<User, number>(data =>
      Promise.all(
        data.map(async user => await this.repos.follow.getFollowersCount(user))
      )
    )
  }

  followingsCount() {
    return new DataLoader<User, number>(data =>
      Promise.all(
        data.map(async user => await this.repos.follow.getFollowingsCount(user))
      )
    )
  }

  hasCurrentStory() {
    return new DataLoader<User, boolean>(data =>
      Promise.all(
        data.map(async user => await this.repos.story.hasCurrentStory(user))
      )
    )
  }

  isFollowing() {
    return new DataLoader<isFollowing, boolean>(data =>
      Promise.all(
        data.map(async data => {
          return await this.repos.follow.isFollowing(data.current, data.user)
        })
      )
    )
  }

  seen() {
    return new DataLoader<isFollowing, boolean>(data =>
      Promise.all(
        data.map(async data => {
          const { user, current } = data
          const stories = await this.repos.story.getUserStories(user)
          return await Aigle.resolve(stories).every(async story => {
            const hasSeen = await this.repos.story.hasSeenStory(story, current)
            return hasSeen === true
          })
        })
      )
    )
  }
}
