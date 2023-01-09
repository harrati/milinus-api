import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { DeepPartial, Repository, getManager } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { LibsService } from '../../libs/libs.service'
import {
  UserStatus,
  UserSubscriptionStatus,
  UserSubscriptionPeriod,
} from './user.types'
import { NotificationSettingsTypes } from '../notification/notification.types'
import { OrderByDirection } from '../../utils/types'
import { Comment } from '../comment/comment.entity'
import { Story } from '../story/story.entity'
import { Media } from '../media/media.entity'
import { UserPlanet } from '../planet/userPlanet.entity'
import { Notification, PushToken } from '../notification/notification.entity'
import { Evolution } from '../evolution/evolution.entity'
import { StoryView } from '../story/storyView.entity'
import { StoryReaction } from '../story/storyReaction.entity'
import { Report } from '../report/report.entity'
import { PlaceUser } from '../place/placeUser.entity'
import { UserRecipe } from '../recipe/userRecipes.entity'
import { Follow } from '../follow/follow.entity'
import { Running } from '../running/running.entity'
import { UserProgram } from '../userProgram/userProgram.entity'
import { TrainingReport } from '../trainingReport/trainingReport.entity'
import { Post } from '../post/post.entity'

type UserDateField = 'lastLogin' | 'processedAt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) public readonly userRepository: Repository<User>,
    private readonly libs: LibsService
  ) {}

  async createUser(
    payload: Pick<
      User,
      | 'firstName'
      | 'lastName'
      | 'password'
      | 'userName'
      | 'email'
      | 'facebookId'
      | 'appleId'
      | 'pictureUrl'
    > & { uuid?: string }
  ) {
    const userPayload = payload.password
      ? {
          ...payload,
          password: await this.libs.bcrypt.createCryptedPassword(
            payload.password
          ),
        }
      : payload
    const user = this.userRepository.create(userPayload)
    return await this.userRepository.save(user)
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ email })
  }

  async findByUuid(uuid: string) {
    return await this.userRepository.findOne({ uuid })
  }

  async findByUserName(userName: string) {
    return await this.userRepository.findOne({ userName })
  }

  async findAllByUserName(search: string, first = 10, after?: string) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.userName) like LOWER(:userName)', {
        userName: `%${search}%`,
      })

    const paginator = this.libs.paginator.getPaginator(User, {
      first,
      after,
    })
    return await paginator.manualPaginate(qb)
  }

  async findByFacebookId(facebookId: string) {
    return await this.userRepository.findOne({ facebookId })
  }

  async findByAppleId(appleId: string) {
    return await this.userRepository.findOne({ appleId })
  }

  async findAllBySubscriptionStatus(
    subscriptionStatus: UserSubscriptionStatus
  ) {
    return await this.userRepository.find({ subscriptionStatus })
  }

  async verifyPreniumSubscription(users: User[]) {
    users.map(async (user: User) => {
      const SubscriptionDate = user.EndDateSubscription

      if (SubscriptionDate < new Date()) {
        await this.userRepository.update(user.id, {
          subscriptionStatus: UserSubscriptionStatus.FREE,
          EndDateSubscription: null,
        })
      }
    })
  }

  async findAllWithoutProgramStarted() {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.programs', 'programs')
      .where('programs IS null')
      .getMany()

    return qb
  }

  async findAllByActiveNotificationSetting(
    notificationSetting: NotificationSettingsTypes
  ): Promise<Array<User>> {
    const qb = this.userRepository.createQueryBuilder('user')
    qb.where('status = :status', { status: UserStatus.ACTIVE })
      .andWhere(
        `"notificationSettings"::JSONB @> '{ "${notificationSetting}": "ACTIVE" }'`,
        { notificationSetting: notificationSetting }
      )
      .leftJoinAndSelect('user.pushTokens', 'pushTokens')
    return await qb.getMany()
  }

  async createResetPasswordToken(email: string) {
    const resetPasswordToken = uuidv4()
    const user = await this.userRepository.findOne({ email })
    if (!user) throw new Error('email-not-found')
    if (user.facebookId || user.appleId) throw new Error('social-user')
    user.resetPasswordToken = resetPasswordToken
    return await this.userRepository.save(user)
  }

  async resetPasswordToken(resetPasswordToken: string, password: string) {
    const user = await this.userRepository.findOneOrFail({ resetPasswordToken })
    user.resetPasswordToken = null
    user.password = await this.libs.bcrypt.createCryptedPassword(password)
    return await this.userRepository.save(user)
  }

  async updateAndFetch(user: User, payload: DeepPartial<User>) {
    await this.userRepository.update(user.id, {
      status:
        user.status === UserStatus.PENDING ? UserStatus.ACTIVE : user.status,
      ...payload,
    })
    const updatedUser = await this.userRepository.findOneOrFail(user.id)
    return updatedUser
  }

  async updateUserStatus(user: User, status: UserStatus) {
    await this.userRepository.update(user.id, {
      status,
    })
    const updatedUser = await this.userRepository.findOneOrFail(user.id)
    return updatedUser
  }

  async updateUserStatusSubscription(
    user: User,
    subscriptionStatus: UserSubscriptionStatus,
    period: UserSubscriptionPeriod
  ) {
    const DateNow = new Date()
    const CalculateDate =
      period === UserSubscriptionPeriod.PERIOD_1
        ? DateNow.setMonth(
            DateNow.getMonth() + parseInt(UserSubscriptionPeriod.PERIOD_1)
          )
        : period === UserSubscriptionPeriod.PERIOD_2
        ? DateNow.setMonth(
            DateNow.getMonth() + parseInt(UserSubscriptionPeriod.PERIOD_2)
          )
        : period === UserSubscriptionPeriod.PERIOD_3
        ? DateNow.setMonth(
            DateNow.getMonth() + parseInt(UserSubscriptionPeriod.PERIOD_3)
          )
        : ''

    const EndDateSubscription =
      subscriptionStatus === UserSubscriptionStatus.PREMIUM
        ? new Date(CalculateDate)
        : null
    await this.userRepository.update(
      { uuid: user.uuid },
      {
        subscriptionStatus,
        EndDateSubscription,
      }
    )
    const updatedUser = await this.userRepository.findOneOrFail({
      uuid: user.uuid,
    })
    return updatedUser
  }

  async delete(user: User) {
    await getManager().transaction(async transactionalEntityManager => {
      transactionalEntityManager.delete(Story, { user: user })
      transactionalEntityManager.delete(Post, { user: user })
      transactionalEntityManager.delete(Media, { user: user })
      transactionalEntityManager.delete(Notification, { user: user })
      transactionalEntityManager.delete(UserPlanet, { user: user })
      transactionalEntityManager.delete(Evolution, { user: user })
      transactionalEntityManager.delete(StoryView, { user: user })
      transactionalEntityManager.delete(StoryReaction, { user: user })
      transactionalEntityManager.delete(Comment, { user: user })
      transactionalEntityManager.delete(Report, { user: user })
      transactionalEntityManager.delete(PlaceUser, { user: user })
      transactionalEntityManager.delete(UserRecipe, { user: user })
      transactionalEntityManager.delete(Follow, { follower: user })
      transactionalEntityManager.delete(Follow, { following: user })
      transactionalEntityManager.delete(Running, { user: user })
      transactionalEntityManager.delete(UserProgram, { user: user })
      transactionalEntityManager.delete(TrainingReport, { user: user })
      transactionalEntityManager.delete(PushToken, { user: user })
      transactionalEntityManager.update(
        User,
        { user },
        {
          email: 'DELETED-' + user.email,
          password: null,
          pictureUrl: null,
          phone: null,
          status: UserStatus.DELETED,
          age: null,
          currentWeight: 0,
          wantedWeight: 0,
          height: 0,
        }
      )
    })

    return true
  }

  async getUsers(search?: string, first = 10, after?: string) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: UserStatus.ACTIVE })

    if (search) {
      qb.where('LOWER("firstName") LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      })
        .orWhere('LOWER("lastName") LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        })
        .orWhere('LOWER("userName") LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        })
    }

    const paginator = this.libs.paginator.getPaginator(User, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.ASC,
      first,
      after,
    })
    const connection = await paginator.manualPaginate(qb)
    return connection
  }

  async getUsersBy(status: UserStatus, date: Date, dateField: UserDateField) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status })
      .andWhere(`user.${dateField} < :date`, { date: date })

    return qb.getMany()
  }
}
