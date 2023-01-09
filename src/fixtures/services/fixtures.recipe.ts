import { Injectable } from '@nestjs/common'
import { sampleSize, flatMap, map } from 'lodash'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository, ObjectLiteral } from 'typeorm'
import { LibsService } from '../../libs/libs.service'
import { Recipe } from '../../modules/recipe/recipe.entity'
import { DEFAULT_VIDEO_URL } from '../../utils/constants'
import { User } from '../../modules/user/user.entity'
import { UserRecipe } from '../../modules/recipe/userRecipes.entity'
import {
  RecipeDifficulties,
  RecipeCategories,
  RecipeRestrictions,
  RecipePreparationTimes,
} from '../../modules/recipe/recipe.types'
import { ToggleStatus } from '../../utils/types'
import recipes from '../data/recipe.json'

export const difficultyMapper: ObjectLiteral = {
  ['EASY']: RecipeDifficulties.EASY,
  ['NORMAL']: RecipeDifficulties.NORMAL,
  ['HARD']: RecipeDifficulties.HARD,
  ['EXPERT']: RecipeDifficulties.EXPERT,
}

export const categoriesMapper: ObjectLiteral = {
  ['BREAKFAST']: RecipeCategories.BREAKFAST,
  ['LUNCH']: RecipeCategories.LUNCH,
  ['SNACK']: RecipeCategories.SNACK,
  ['DINER']: RecipeCategories.DINER,
}

export const restrictionsMapper: ObjectLiteral = {
  ['GLUTEN']: RecipeRestrictions.GLUTEN,
  ['LACTOSE']: RecipeRestrictions.LACTOSE,
  ['VEGAN']: RecipeRestrictions.VEGAN,
  ['VEGGIE']: RecipeRestrictions.VEGGIE,
}

export const preparationTimesMapper: ObjectLiteral = {
  ['PREPARATION_15']: RecipePreparationTimes.PREPARATION_15,
  ['PREPARATION_30']: RecipePreparationTimes.PREPARATION_30,
  ['PREPARATION_40']: RecipePreparationTimes.PREPARATION_40,
  ['PREPARATION_45']: RecipePreparationTimes.PREPARATION_45,
}

export const statusMapper: ObjectLiteral = {
  ['ACTIVE']: ToggleStatus.ACTIVE,
  ['INACTIVE']: ToggleStatus.INACTIVE,
}

@Injectable()
export class FixturesRecipeService {
  private readonly recipeRepository: Repository<Recipe>
  private readonly userRecipeRepository: Repository<UserRecipe>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.recipeRepository = connection.getRepository(Recipe)
    this.userRecipeRepository = connection.getRepository(UserRecipe)
  }

  async injectRecipes(users: User[]): Promise<Recipe[]> {
    console.log('seeding recipes...')
    const recipesToCreate: Recipe[] = map(recipes, recipe => {
      const {
        difficulty,
        category,
        preparationTime,
        restrictions,
        status,
        pictureUrl,
      } = recipe
      return this.recipeRepository.create({
        ...recipe,
        pictureUrl: pictureUrl,
        videoUrl: DEFAULT_VIDEO_URL,
        difficulty: difficultyMapper[difficulty],
        category: categoriesMapper[category],
        preparationTime: preparationTimesMapper[preparationTime],
        restrictions: map(
          restrictions,
          restriction => restrictionsMapper[restriction]
        ),
        status: statusMapper[status],
      })
    })
    const created = await this.recipeRepository.save(recipesToCreate)

    console.log('seeding user/recipes relations...')
    const userRecipes = flatMap(users, user => {
      const sampleRecipes = sampleSize(created, 30)
      return sampleRecipes.map(recipe =>
        this.userRecipeRepository.create({
          user,
          recipe,
        })
      )
    })
    await this.userRecipeRepository.save(userRecipes)

    return created
  }
}
