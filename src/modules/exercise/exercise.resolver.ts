import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { ReposService } from './../repos.service'
import { UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { GraphqlFileFieldsInterceptor } from '../../interceptors/graphql-file-fields.interceptor'
import { Exercise } from './exercise.entity'
import { ExerciseConnection } from './exercise.types'
import {
  ExercisesArgs,
  CreateExerciseArgs,
  UpdateExerciseArgs,
} from './exercises.inputs'
import {
  OrderByDirection,
  OrderName,
  PageInput,
  WhereUniqueArgs,
} from '../../utils/types'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { UserLanguage } from '../user/user.types'

@UseGuards(AuthGuard)
@Resolver(() => Exercise)
export class ExerciseResolver {
  constructor(private readonly repos: ReposService) { }

  @Query(() => ExerciseConnection)
  randomExercises(
    @CurrentUser() user: User,
    @Args() args: PageInput
  ): Promise<ExerciseConnection> {
    const { first, after } = args
    const orderBy = user
      ? user.language === UserLanguage.EN
        ? OrderName.nameEn
        : OrderName.name
      : OrderName.name
    return this.repos.exercise.getExercises(
      null,
      first,
      after,
      OrderByDirection.ASC,
      orderBy
    )
  }

  @Query(() => ExerciseConnection)
  exercises(@CurrentUser() user: User, @Args() args: ExercisesArgs) {
    const { where, after, first, order, orderName } = args

    const orderBy = orderName
      ? orderName
      : user
        ? user.language === UserLanguage.EN
          ? OrderName.nameEn
          : OrderName.name
        : OrderName.name

    return this.repos.exercise.getExercises(where, first, after, order, orderBy)
  }

  @Query(() => Exercise)
  exercise(@Args() args: WhereUniqueArgs): Promise<Exercise> {
    return this.repos.exercise.findByUuid(args.uuid)
  }

  @Mutation(() => Boolean)
  deleteExercise(@Args() args: WhereUniqueArgs): boolean {
    this.repos.exercise.deleteByUuid(args.uuid)
    return true
  }

  @Mutation(() => Exercise)
  duplicateExercise(@Args() args: WhereUniqueArgs): Promise<Exercise> {
    return this.repos.exercise.copyExercise(args.uuid)
  }

  @Mutation(() => Exercise)
  @UseInterceptors(GraphqlFileFieldsInterceptor)
  async createExercise(@Args() args: CreateExerciseArgs) {
    return await this.repos.exercise.createExercise(args)
  }

  @Mutation(() => Exercise)
  @UseInterceptors(GraphqlFileFieldsInterceptor)
  async updateExercise(@Args() args: UpdateExerciseArgs) {
    const { where, data } = args
    return await this.repos.exercise.updateExercise(where, data)
  }

  @ResolveField('nameTrans', () => String)
  async nameTrans(
    @Parent() exercise: Exercise,
    @CurrentUser() user: User
  ): Promise<string> {
    return user ? user.language === UserLanguage.EN ? exercise.nameEn : exercise.name : exercise.name
  }

  @ResolveField('descriptionTrans', () => String)
  async descriptionTrans(
    @Parent() exercise: Exercise,
    @CurrentUser() user: User
  ): Promise<string> {
    console.log(6666666666666666666666666666)
    console.log(user)
    console.log(exercise.description)
    console.log(exercise.descriptionEn)
    console.log(exercise)
    return user ? user.language === UserLanguage.EN
      ? exercise.descriptionEn
      : exercise.description : exercise.description
  }
}
