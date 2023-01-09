import { Resolver, Mutation, Query, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { LibsService } from '../../libs/libs.service'
import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { Status, CurrentUser, CurrentAdmin } from '../../decorators'
import { User } from '../user/user.entity'
import { UserStatus } from '../user/user.types'
import {
  UpdateUserTrainingInformationsArgs,
  SubscribePremiumArgs,
  UpdateProfileArgs,
  UpdateProfilePictureArgs,
  ProfileArgs,
} from './profile.inputs'
import { UserObjectives, Profile, TrainingEquipments } from './profile.types'
import { DeepPartial } from 'typeorm'
import { Admin } from '../admin/admin.entity'
import { sumBy } from 'lodash'

@Resolver(() => User)
export class ProfileResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly libs: LibsService
  ) {}

  @Query(() => User)
  @Status(UserStatus.PENDING, UserStatus.BANNED, UserStatus.ACTIVE)
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User): User {
    return user
  }

  @Query(() => Admin)
  @UseGuards(AuthGuard)
  meAdmin(@CurrentAdmin() admin: Admin): Admin {
    return admin
  }

  @Mutation(() => User)
  @Status(UserStatus.PENDING, UserStatus.BANNED, UserStatus.ACTIVE)
  @UseGuards(AuthGuard)
  async updateUserTrainingInformations(
    @CurrentUser() user: User,
    @Args() args: UpdateUserTrainingInformationsArgs
  ): Promise<DeepPartial<User>> {
    const {
      objective,
      trainingFrequency,
      gender,
      age,
      looseWeightInformations,
      stayInshapeInformations,
      buildUpInformations,
      currentWeight,
      wantedWeight,
      height,
      language,
    } = args
    if (
      (objective === UserObjectives.LOOSE_WEIGHT && !looseWeightInformations) ||
      (objective === UserObjectives.STAY_INSHAPE && !stayInshapeInformations) ||
      (objective === UserObjectives.BUILD_UP && !buildUpInformations)
    )
      throw new Error('training-information')

    const objectiveInformation =
      objective === UserObjectives.LOOSE_WEIGHT
        ? looseWeightInformations
        : objective === UserObjectives.STAY_INSHAPE
        ? stayInshapeInformations
        : buildUpInformations

    objectiveInformation.equipments.push(TrainingEquipments.BENCH)

    const updatedUser = await this.repos.user.updateAndFetch(user, {
      trainingFrequency,
      gender,
      age,
      currentWeight,
      wantedWeight,
      height,
      objective,
      language: language ? language : user.language,
      ...objectiveInformation,
    })

    return updatedUser
  }

  @Mutation(() => User, { description: 'Not implemented' })
  subscribePremium(
    @Args() args: SubscribePremiumArgs
  ): Promise<DeepPartial<User>> {
    console.log(args)
    return null
  }

  @Mutation(() => Boolean, { description: 'Not implemented' })
  rgpd(): Promise<DeepPartial<boolean>> {
    return null
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  updateProfile(
    @CurrentUser() user: User,
    @Args() args: UpdateProfileArgs
  ): Promise<DeepPartial<User>> {
    return this.repos.user.updateAndFetch(user, args)
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  updateProfilePicture(
    @CurrentUser() user: User,
    @Args() args: UpdateProfilePictureArgs
  ): Promise<DeepPartial<User>> {
    return this.repos.user.updateAndFetch(user, args)
  }

  @Query(() => Profile)
  @UseGuards(AuthGuard)
  async profile(
    @CurrentUser() currentUser: User,
    @Args() args: ProfileArgs
  ): Promise<Profile> {
    const user = args.where
      ? await this.repos.user.findByUuid(args.where.userUuid)
      : currentUser
    if (!user) throw new Error('not-found')
    if (user.status === UserStatus.BANNED) throw new Error('user-banned')

    const trainingReports = await this.repos.trainingReport.findByUser(user)
    return {
      kcal: sumBy(trainingReports, 'kcal'),
      trainingNumber: trainingReports.length,
      points: sumBy(trainingReports, 'points'),
    }
  }
}
