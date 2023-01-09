import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  Index,
  Generated,
} from 'typeorm'
import { Story } from '../story/story.entity'
import { Media } from '../media/media.entity'
import { Notification, PushToken } from '../notification/notification.entity'
import { ToggleStatus } from '../../utils/types'
import { Evolution } from '../evolution/evolution.entity'
import { StoryReaction } from '../story/storyReaction.entity'
import { Comment } from '../comment/comment.entity'
import { Report } from '../report/report.entity'
import { PlaceUser } from '../place/placeUser.entity'
import { UserRecipe } from '../recipe/userRecipes.entity'
import { Follow } from '../follow/follow.entity'
import { Running } from '../running/running.entity'
import { UserProgram } from '../userProgram/userProgram.entity'
import { UserPlanet } from '../planet/userPlanet.entity'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import {
  UserGenders,
  UserStatus,
  ExerciseParamsType,
  NotificationSettings,
  UserSubscriptionStatus,
  ChartWeightBoundaries,
  UserLanguage,
} from './user.types'
import {
  UserTrainingFrequencies,
  UserObjectives,
  BodyAreas,
  TrainingEquipments,
  UserRunningCapacities,
  UserProgramSchedules,
  WeightBarLevels,
} from '../profile/profile.types'
import { TrainingReport } from '../trainingReport/trainingReport.entity'
import { System } from '../system/system.entity'
import { StoryView } from '../story/storyView.entity'
import { Post } from '../post/post.entity'
import { Program } from '../program/program.entity'

const defaultExerciseParams: ExerciseParamsType = {
  repetition: 0,
  maxWeight: 0,
}

@Entity({
  name: 'users',
  orderBy: {
    createdAt: 'ASC',
  },
})
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  id!: string

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar', length: 500, unique: true })
  @Index()
  @Field({ nullable: true })
  email?: string

  @Column({ type: 'varchar', default: 'Fanto' })
  @Field()
  firstName!: string

  @Column({ type: 'varchar', default: 'Masse' })
  @Field()
  lastName!: string

  @Column({ type: 'varchar', unique: true })
  @Field()
  userName!: string

  @Column({ type: 'varchar', nullable: true })
  password?: string

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken?: string

  @Column({ type: 'varchar', default: '' })
  @Field()
  description!: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  pictureUrl?: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  phone?: string

  @Column({ type: 'enum', enum: UserLanguage, default: UserLanguage.FR })
  @Field(() => UserLanguage)
  language!: UserLanguage

  @Column({ type: 'enum', enum: UserGenders, default: UserGenders.NON_BINARY })
  @Field(() => UserGenders)
  gender!: UserGenders

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  @Field(() => UserStatus)
  status!: UserStatus

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Field(() => Date, { nullable: true })
  EndDateSubscription: Date

  @Column({
    type: 'enum',
    enum: UserSubscriptionStatus,
    default: UserSubscriptionStatus.FREE,
  })
  @Field(() => UserSubscriptionStatus)
  subscriptionStatus!: UserSubscriptionStatus

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Index()
  facebookId?: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Index()
  appleId?: string

  @Field(() => NotificationSettings)
  @Column({
    type: 'simple-json',
    default: {
      trainingReminder: ToggleStatus.ACTIVE,
      publish: ToggleStatus.ACTIVE,
      news: ToggleStatus.ACTIVE,
    },
  })
  notificationSettings!: NotificationSettings

  @Column({ type: 'numeric', nullable: true })
  @Field(() => Int, { nullable: true })
  age: number

  @Column({ type: 'numeric', nullable: true })
  @Field(() => Int, { nullable: true })
  currentWeight: number

  @Column({ type: 'numeric', nullable: true })
  @Field(() => Int, { nullable: true })
  wantedWeight: number

  @Column({ type: 'numeric', nullable: true })
  @Field(() => Int, { nullable: true })
  height: number

  @Field(() => Int)
  followersCount: number

  @Field(() => Int)
  followingsCount: number

  @Field()
  hasCurrentStory: boolean

  @Field({ nullable: true })
  currentProgram: Program

  @Field({ nullable: true })
  isFollowing?: boolean

  @Field(() => ChartWeightBoundaries, { nullable: true })
  chartWeightBoundaries?: ChartWeightBoundaries

  @Field()
  hasCompletedRegistration: boolean

  @Field(() => System, { nullable: true })
  system?: System

  @Field(() => Boolean, { nullable: true })
  seen?: boolean

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  hasCompletedSystemTutorial: boolean

  /*  RECUEIL ******************************************************** */

  @Column({
    type: 'enum',
    enum: UserTrainingFrequencies,
    default: UserTrainingFrequencies.NOOB,
  })
  trainingFrequency!: UserTrainingFrequencies

  @Column({
    type: 'enum',
    enum: UserObjectives,
    default: UserObjectives.STAY_INSHAPE,
  })
  objective!: UserObjectives

  @Column({
    type: 'enum',
    array: true,
    enum: BodyAreas,
    default: [],
  })
  targetedBodyAreas!: BodyAreas[]

  @Column({
    type: 'enum',
    array: true,
    enum: TrainingEquipments,
    default: [],
    nullable: true,
  })
  equipments: TrainingEquipments[]

  @Column({
    type: 'enum',
    enum: UserRunningCapacities,
    default: UserRunningCapacities.CANT_RUN,
  })
  runningCapacity!: UserRunningCapacities

  @Column({
    type: 'enum',
    enum: UserProgramSchedules,
    default: UserProgramSchedules.ONCE,
  })
  programSchedule!: UserProgramSchedules

  @Column({
    type: 'simple-json',
    default: defaultExerciseParams,
    nullable: true,
  })
  squats: ExerciseParamsType

  @Column({
    type: 'simple-json',
    default: defaultExerciseParams,
    nullable: true,
  })
  rowings: ExerciseParamsType

  @Column({
    type: 'simple-json',
    default: defaultExerciseParams,
    nullable: true,
  })
  benchPresses: ExerciseParamsType

  @Column({
    type: 'simple-json',
    default: defaultExerciseParams,
    nullable: true,
  })
  deadlifts: ExerciseParamsType

  @Column({
    type: 'enum',
    enum: WeightBarLevels,
    default: WeightBarLevels.NO,
    nullable: true,
  })
  weightBarLevel: WeightBarLevels

  /*  RELATIONS ******************************************************** */

  @OneToMany(() => Story, story => story.user)
  stories: Story[]

  @OneToMany(() => Post, post => post.user)
  posts: Post[]

  @OneToMany(() => Media, media => media.user)
  medias: Media[]

  @OneToMany(() => Notification, notification => notification.user, {
    onDelete: 'CASCADE',
  })
  notifications: Notification[]

  @OneToMany(() => Notification, notification => notification.author, {
    onDelete: 'CASCADE',
  })
  authors: Notification[]

  @OneToMany(() => UserPlanet, userPlanet => userPlanet.user, {
    onDelete: 'CASCADE',
  })
  userPlanets!: UserPlanet[]

  @OneToMany(() => Evolution, evolution => evolution.user, {
    onDelete: 'CASCADE',
  })
  evolutions!: Evolution[]

  @OneToMany(() => StoryView, storyView => storyView.user, {
    onDelete: 'CASCADE',
  })
  views: StoryView[]

  @OneToMany(() => StoryReaction, storyReaction => storyReaction.user, {
    onDelete: 'CASCADE',
  })
  reactions: StoryReaction[]

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[]

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @OneToMany(() => PlaceUser, place => place.user)
  places: PlaceUser[]

  @OneToMany(() => UserRecipe, recipe => recipe.user)
  recipes: UserRecipe[]

  @OneToMany(() => Follow, follow => follow.follower)
  followings!: Follow[]

  @OneToMany(() => Follow, follow => follow.following)
  followers!: Follow[]

  @OneToMany(() => Running, running => running.user)
  runnings!: Running[]

  @OneToMany(() => UserProgram, userProgram => userProgram.user, {
    onDelete: 'CASCADE',
  })
  programs!: UserProgram[]

  @OneToMany(() => TrainingReport, trainingReport => trainingReport.user, {
    onDelete: 'CASCADE',
  })
  trainingReports!: TrainingReport[]

  @OneToMany(() => PushToken, pushToken => pushToken.user, {
    onDelete: 'CASCADE',
  })
  pushTokens: PushToken[]

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Field(() => Date, { nullable: true })
  lastLogin: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Field(() => Date, { nullable: true })
  processedAt: Date

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field()
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date
}
