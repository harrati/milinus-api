import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Recipe } from './recipe.entity'
import { Repository, DeepPartial } from 'typeorm'
import { CreateRecipesArgs, RecipeUpdateInput } from './recipe.inputs'
import {
  WhereUniqueInput,
  OrderByDirection,
  ToggleStatus,
  OrderName,
} from '../../utils/types'
import { LibsService } from '../../libs/libs.service'
import {
  RecipeDifficulties,
  RecipeCategories,
  RecipePreparationTimes,
  RecipeRestrictions,
} from './recipe.types'
import { UserRecipe } from './userRecipes.entity'
import { User } from '../user/user.entity'
import { DAILY_MAX_RECIPE_PER_USER } from '../../utils/constants'

type RecipeFilters = {
  search?: string
  difficulty?: RecipeDifficulties[]
  category?: RecipeCategories[]
  preparationTime?: RecipePreparationTimes[]
  restrictions?: RecipeRestrictions[]
  status?: ToggleStatus
}

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    public readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(UserRecipe)
    public readonly userRecipeRepository: Repository<UserRecipe>,
    private readonly libs: LibsService
  ) {}

  findByUuid(uuid: string): Promise<Recipe> {
    return this.recipeRepository.findOne({ uuid })
  }

  findOneRandom(): Promise<Recipe> {
    const qb = this.recipeRepository.createQueryBuilder('recipe')
    qb.orderBy('RANDOM()')
    const recipe = qb.getOne()
    return recipe
  }

  async deleteByUuid(uuid: string) {
    return await this.recipeRepository.delete({ uuid })
  }

  async createRecipe(
    recipePayload: DeepPartial<CreateRecipesArgs>
  ): Promise<Recipe> {
    const recipe = this.recipeRepository.create(recipePayload as DeepPartial<
      Recipe
    >)
    return await this.recipeRepository.save(recipe)
  }

  async updateRecipe(
    recipe: WhereUniqueInput,
    payload: DeepPartial<RecipeUpdateInput>
  ): Promise<Recipe> {
    await this.recipeRepository.update(
      { uuid: recipe.uuid },
      { ...(payload as DeepPartial<Recipe>) }
    )
    const updatedRecipe = await this.recipeRepository.findOneOrFail({
      uuid: recipe.uuid,
    })
    return updatedRecipe
  }

  async getRecipes(
    filters?: RecipeFilters,
    first = 10,
    after?: string,
    order = OrderByDirection.ASC,
    orderBy = OrderName.name,
    searchBy = 'name'
  ) {
    const qb = this.recipeRepository.createQueryBuilder('recipe')

    if (filters && filters.status) {
      qb.andWhere('recipe.status = :status', {
        status: filters.status,
      })
    }

    if (filters && filters.difficulty) {
      qb.andWhere('recipe."difficulty" IN (:...difficulty)', {
        difficulty: filters.difficulty,
      })
    }

    if (filters && filters.category) {
      qb.andWhere('recipe.category IN (:...category)', {
        category: filters.category,
      })
    }

    if (filters && filters.preparationTime) {
      qb.andWhere('recipe."preparationTime" IN (:...preparationTime)', {
        preparationTime: filters.preparationTime,
      })
    }

    if (filters && filters.restrictions) {
      qb.andWhere('recipe.restrictions @> (:restrictions)', {
        restrictions: filters.restrictions,
      })
    }

    if (filters && filters.search) {
      qb.andWhere('LOWER(recipe."' + searchBy + '") LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      })
    }

    const paginator = this.libs.paginator.getPaginator(Recipe, {
      orderBy: orderBy,
      orderByDirection: order,
      first,
      after,
    })
    const connection = await paginator.paginate(qb)
    return connection
  }

  findUserRecipe(user: User, recipe: Recipe): Promise<UserRecipe> {
    return this.userRecipeRepository.findOne({ user, recipe })
  }

  deleteUserRecipe(user: User, recipe: Recipe) {
    return this.userRecipeRepository.delete({ user, recipe })
  }

  userCreatedRecipesToday(user: User): Promise<UserRecipe[]> {
    const qb = this.userRecipeRepository.createQueryBuilder('userrecipe')
    qb.where('DATE(userrecipe."createdAt") = current_date').andWhere(
      'userrecipe."userId" = :userId',
      { userId: user.id }
    )
    return qb.getMany()
  }

  async createUserRecipe(user: User, recipeUuid: string) {
    const userRecipeToday = await this.userCreatedRecipesToday(user)
    if (userRecipeToday.length > DAILY_MAX_RECIPE_PER_USER) {
      throw new Error('max-recipe-per-day-reached')
    }

    const recipe: Recipe = await this.findByUuid(recipeUuid)

    const recipePayload = {
      user: user,
      recipe: recipe,
    }

    const userRecipe = this.userRecipeRepository.create(
      recipePayload as DeepPartial<UserRecipe>
    )
    await this.userRecipeRepository.save(userRecipe)
    return recipe
  }

  async getThumbnailUrl(recipe: Recipe) {
    if (recipe.thumbnailPictureUrl) return recipe.thumbnailPictureUrl
    if (!recipe.pictureUrl) return null

    const { pictureUrl } = recipe
    const thumbnailPath = await this.libs.image.thumbnail(pictureUrl)
    const thumbnailImageUploadedPath = await this.libs.firebase.uploadFileFromPath(
      thumbnailPath,
      'image'
    )

    await this.recipeRepository.update(
      { uuid: recipe.uuid },
      { thumbnailPictureUrl: thumbnailImageUploadedPath }
    )

    return thumbnailImageUploadedPath
  }
}
