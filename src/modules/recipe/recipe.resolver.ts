import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { RecipeConnection } from './recipe.types'
import { DeepPartial } from 'typeorm'
import { Recipe } from './recipe.entity'
import {
  RecipesArgs,
  RecipeArgs,
  CreateRecipesArgs,
  UpdateRecipesArgs,
} from './recipe.inputs'
import { ReposService } from '../repos.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../guards'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { UserLanguage } from '../user/user.types'
import { OrderName } from '../../utils/types'

@UseGuards(AuthGuard)
@Resolver(() => Recipe)
export class RecipeResolver {
  constructor(private readonly repos: ReposService) {}

  @Query(() => RecipeConnection)
  recipeSuggestions(
    @CurrentUser() user: User,
    @Args() args: RecipesArgs
  ): Promise<DeepPartial<RecipeConnection>> {
    const { where, after, first, order } = args
    const orderBy = user
      ? user.language === UserLanguage.EN
        ? OrderName.nameEn
        : OrderName.name
      : OrderName.name
    const searchBy = user.language === UserLanguage.EN ? 'nameEn' : 'name'
    return this.repos.recipe.getRecipes(
      where,
      first,
      after,
      order,
      orderBy,
      searchBy
    )
  }

  @Query(() => Recipe)
  recipe(@Args() args: RecipeArgs): Promise<DeepPartial<Recipe>> {
    return this.repos.recipe.findByUuid(args.uuid)
  }

  @Query(() => RecipeConnection)
  recipes(
    @CurrentUser() user: User,
    @Args() args: RecipesArgs
  ): Promise<DeepPartial<RecipeConnection>> {
    const { where, after, first, order } = args
    const orderBy = user
      ? user.language === UserLanguage.EN
        ? OrderName.nameEn
        : OrderName.name
      : OrderName.name
    const searchBy = user
      ? user.language === UserLanguage.EN
        ? 'nameEn'
        : 'name'
      : 'name'
    return this.repos.recipe.getRecipes(
      where,
      first,
      after,
      order,
      orderBy,
      searchBy
    )
  }

  @Query(() => Recipe)
  randomRecipe(): Promise<DeepPartial<Recipe>> {
    return this.repos.recipe.findOneRandom()
  }

  @Mutation(() => Recipe)
  async toogleCook(
    @Args() args: RecipeArgs,
    @CurrentUser() user: User
  ): Promise<DeepPartial<Recipe>> {
    const recipe = await this.repos.recipe.findByUuid(args.uuid)
    const userRecipe = await this.repos.recipe.findUserRecipe(user, recipe)
    if (!userRecipe) {
      return this.repos.recipe.createUserRecipe(user, args.uuid)
    }
    await this.repos.recipe.deleteUserRecipe(user, recipe)
    return recipe
  }

  @Mutation(() => Recipe)
  createRecipe(@Args() args: CreateRecipesArgs): Promise<DeepPartial<Recipe>> {
    return this.repos.recipe.createRecipe(args)
  }

  @Mutation(() => Recipe)
  updateRecipe(@Args() args: UpdateRecipesArgs): Promise<DeepPartial<Recipe>> {
    const { where, data } = args
    return this.repos.recipe.updateRecipe(where, data)
  }

  @Mutation(() => Boolean)
  async deleteRecipe(@Args() args: RecipeArgs): Promise<boolean> {
    await this.repos.recipe.deleteByUuid(args.uuid)
    return true
  }

  @ResolveField('hasCooked', () => Boolean)
  async duration(
    @Parent() recipe: Recipe,
    @CurrentUser() user: User
  ): Promise<boolean> {
    const userRecipe = await this.repos.recipe.findUserRecipe(user, recipe)
    return !!userRecipe
  }

  @ResolveField('thumbnailPictureUrl', () => String)
  async thumbnailPictureUrl(@Parent() recipe: Recipe): Promise<string> {
    return await this.repos.recipe.getThumbnailUrl(recipe)
  }

  @ResolveField('nameTrans', () => String)
  async nameTrans(
    @Parent() recipe: Recipe,
    @CurrentUser() user: User
  ): Promise<string> {
    return user.language === UserLanguage.EN ? recipe.nameEn : recipe.name
  }

  @ResolveField('descriptionTrans', () => String)
  async descriptionTrans(
    @Parent() recipe: Recipe,
    @CurrentUser() user: User
  ): Promise<string> {
    return user.language === UserLanguage.EN
      ? recipe.descriptionEn
      : recipe.description
  }
}
