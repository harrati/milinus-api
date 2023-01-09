import { Injectable } from '@nestjs/common'
import { times, sample, random, sampleSize } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { User } from '../../modules/user/user.entity'
import { devUsers } from '../data/users'
import {
  UserObjectives,
  UserTrainingFrequencies,
  BodyAreas,
  TrainingEquipments,
  UserRunningCapacities,
  UserProgramSchedules,
  WeightBarLevels,
} from '../../modules/profile/profile.types'
import { UserGenders, UserStatus } from '../../modules/user/user.types'

@Injectable()
export class FixturesUserService {
  private readonly repository: Repository<User>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.repository = connection.getRepository(User)
  }

  private createRecueil(noEquipement?: boolean) {
    return {
      age: random(25, 45),
      height: random(160, 200),
      currentWeight: random(50, 100),
      wantedWeight: random(50, 100),
      trainingFrequency: sample(UserTrainingFrequencies),
      objective: sample(UserObjectives),
      targetedBodyAreas: sampleSize(BodyAreas, random(1, 5)),
      equipments: noEquipement
        ? [TrainingEquipments.NONE]
        : sampleSize(
            [
              TrainingEquipments.BENCH,
              TrainingEquipments.DRAW_BAR,
              TrainingEquipments.DUMBBELL,
              TrainingEquipments.WEIGHT_BAR,
            ],
            random(1, 4)
          ),
      runningCapacity: sample(UserRunningCapacities),
      programSchedule: sample(UserProgramSchedules),
      squats: { maxWeight: random(1, 250), repetition: random(1, 25) },
      rowings: { maxWeight: random(1, 250), repetition: random(1, 25) },
      benchPresses: { maxWeight: random(1, 250), repetition: random(1, 25) },
      deadlifts: { maxWeight: random(1, 250), repetition: random(1, 25) },
      weightBarLevel: sample(WeightBarLevels),
    }
  }

  async injectTotemUsers(): Promise<User[]> {
    console.log('seeding real users...')
    const password = await this.lib.bcrypt.createCryptedPassword('totem')
    const users = await Promise.all<User>(
      devUsers.map(user =>
        this.repository.create({
          ...user,
          password: password,
          gender: UserGenders.MALE,
          status: UserStatus.ACTIVE,
          ...this.createRecueil(),
        })
      )
    )
    return this.repository.save(users)
  }

  async injectUsers(): Promise<User[]> {
    console.log('seeding users...')
    const password = await this.lib.bcrypt.createCryptedPassword('totem')
    const fakeUsers = times(10, i =>
      this.repository.create({
        email: `totem${i}@totem.paris`,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.internet.userName(),
        password: password,
        status: UserStatus.ACTIVE,
        gender: sample([
          UserGenders.MALE,
          UserGenders.FEMALE,
          UserGenders.NON_BINARY,
        ]),
        ...this.createRecueil(i % 5 === 0),
      })
    )
    return this.repository.save(fakeUsers)
  }
}
