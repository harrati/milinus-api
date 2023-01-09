import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
  Int,
} from '@nestjs/graphql'
import { ReposService } from './../repos.service'
import { UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard, ProtectedParamsGuard } from '../../guards'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { Program } from './program.entity'
import { ProgramLoader } from './program.loader'
import { ProtectedParams } from '../../decorators/protectedParams.decorator'
import { ProgramConnection } from './program.types'
import { DeepPartial } from 'typeorm'
import {
  CreateProgramArgs,
  UpdateProgramArgs,
  ProgramsArgs,
  MyProgramsArgs,
} from './program.inputs'
import { Training } from '../training/training.entity'
import {
  PageInput,
  WhereUniqueArgs,
  ToggleStatus,
  OrderName,
  OrderByDirection,
} from '../../utils/types'
import { GraphqlFileFieldsInterceptor } from '../../interceptors/graphql-file-fields.interceptor'
import { Evaluation } from '../evaluation/evaluation.entity'
import { System } from '../system/system.entity'
import { TrainingGroup } from '../trainingGroup/trainingGroup.entity'
import { BodyAreas } from '../profile/profile.types'
import { UserLanguage } from '../user/user.types'

@UseGuards(ProtectedParamsGuard, AuthGuard)
@Resolver(() => Program)
export class ProgramResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: ProgramLoader
  ) {}

  @Query(() => ProgramConnection)
  myPrograms(
    @CurrentUser() user: User,
    @Args() args: MyProgramsArgs
  ): Promise<DeepPartial<ProgramConnection>> {
    const { first, after, offer } = args
    return this.repos.program.getUserPrograms(user, first, after, offer)
  }

  @Query(() => ProgramConnection)
  randomPrograms(
    @Args() args: PageInput,
    @CurrentUser() user: User
  ): Promise<DeepPartial<ProgramConnection>> {
    const { first, after } = args
    const filters = {
      status: user ? ToggleStatus.ACTIVE : null,
    }

    const orderBy = user
      ? user.language === UserLanguage.EN
        ? OrderName.nameEn
        : OrderName.name
      : OrderName.name

    return this.repos.program.getPrograms(
      filters,
      first,
      after,
      OrderByDirection.ASC,
      orderBy
    )
  }

  @Query(() => Program)
  program(@Args() args: WhereUniqueArgs): Promise<DeepPartial<Program>> {
    return this.repos.program.findByUuid(args.uuid)
  }

  @Query(() => ProgramConnection)
  @ProtectedParams(['status'])
  async programs(
    @Args() args: ProgramsArgs,
    @CurrentUser() user: User
  ): Promise<DeepPartial<ProgramConnection>> {
    const { after, where, first, order } = args
    const filters = {
      ...where,
      status: user ? ToggleStatus.ACTIVE : where ? where.status : null,
    }
    const orderBy = user
      ? user.language === UserLanguage.EN
        ? OrderName.nameEn
        : OrderName.name
      : OrderName.name

    return this.repos.program.getPrograms(filters, first, after, order, orderBy)
  }

  @UseInterceptors(GraphqlFileFieldsInterceptor)
  @Mutation(() => Program)
  async createProgram(
    @Args() args: CreateProgramArgs
  ): Promise<DeepPartial<Program>> {
    const { systemUuid } = args
    const system = await this.repos.system.findByUuid(systemUuid)
    args.system = system
    return this.repos.program.createProgram(args)
  }

  @UseInterceptors(GraphqlFileFieldsInterceptor)
  @Mutation(() => Program)
  async updateProgram(
    @Args() args: UpdateProgramArgs
  ): Promise<DeepPartial<Program>> {
    const { where, data } = args
    if (data.systemUuid) {
      data.system = await this.repos.system.findByUuid(data.systemUuid)
      delete data.systemUuid
    }

    //if admin wants to activate program, first must have equal number of trainings per difficultie group
    if (data.status && data.status === ToggleStatus.ACTIVE) {
      const trainingGroups = await this.repos.trainingGroup.findByProgramUuid(
        where.uuid
      )
      const numberOfTrainings: Array<number> = trainingGroups.map(
        trainingGroup => trainingGroup.trainings.length
      )
      const allEqual = numberOfTrainings.every(
        value => value === numberOfTrainings[0]
      )
      if (!allEqual)
        throw new Error('not-equal-number-of-trainings-per-difficultie-group')
    }
    return this.repos.program.updateProgram(where, data)
  }

  @Mutation(() => Boolean)
  deleteProgram(@Args() args: WhereUniqueArgs): boolean {
    this.repos.program.deleteByUuid(args.uuid)
    return true
  }

  @Mutation(() => Program)
  async duplicateProgram(@Args() args: WhereUniqueArgs): Promise<Program> {
    const { uuid } = args
    const program = await this.repos.program.duplicate(uuid)
    const trainingGroups = await this.repos.trainingGroup.findByProgramUuid(
      uuid
    )
    await Promise.all(
      trainingGroups.map(async trainingGroup => {
        await this.repos.trainingGroup.createDuplicate(
          trainingGroup.uuid,
          program
        )
      })
    )
    return program
  }

  @ResolveField('trainings', () => [Training])
  async trainings(
    @Parent() program: Program
  ): Promise<DeepPartial<Training[]>> {
    const order = 'position'
    return await this.repos.training.getTrainings(program, null, order)
    // return await this.loader.training().load(program)
  }

  @ResolveField('trainings2', () => [Training])
  async trainings2(
    @Parent() program: Program
  ): Promise<DeepPartial<Training[]>> {
    const order = 'position'
    return await this.repos.training.getTrainings(program, null, order)
    // return await this.loader.training().load(program)
  }

  @ResolveField('duration', () => Int)
  async duration(@Parent() program: Program): Promise<number> {
    return Math.floor((await this.loader.training().load(program)).length / 4)
  }

  @ResolveField('evaluation', () => Evaluation, { nullable: true })
  async evaluation(
    @Parent() program: Program
  ): Promise<DeepPartial<Evaluation>> {
    return await this.loader.evaluation().load(program)
  }

  @ResolveField('trainingGroups', () => [TrainingGroup], { nullable: true })
  async trainingGroups(
    @Parent() program: Program
  ): Promise<Array<DeepPartial<TrainingGroup>>> {
    return await this.loader.trainingGroups().load(program)
  }

  @ResolveField('system', () => System, { nullable: true })
  async system(@Parent() program: Program): Promise<DeepPartial<System>> {
    return await this.loader.system().load(program)
  }

  @ResolveField('bodyAreas', () => [BodyAreas])
  async bodyAreas(@Parent() program: Program): Promise<BodyAreas[]> {
    return await this.loader.bodyAreas().load(program)
  }

  @ResolveField('nameTrans', () => String)
  async nameTrans(
    @Parent() program: Program,
    @CurrentUser() user: User
  ): Promise<string> {
    return user.language === UserLanguage.EN ? program.nameEn : program.name
  }

  @ResolveField('descriptionTrans', () => String)
  async descriptionTrans(
    @Parent() program: Program,
    @CurrentUser() user: User
  ): Promise<string> {
    return user.language === UserLanguage.EN
      ? program.descriptionEn
      : program.description
  }
}
