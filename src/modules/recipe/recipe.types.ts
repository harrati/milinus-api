import { registerEnumType, ObjectType, Field, ID } from '@nestjs/graphql'
import { Recipe } from './recipe.entity'
import { Aggregate, PageInfo } from '../../utils/types'

export enum RecipeDifficulties {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}
registerEnumType(RecipeDifficulties, { name: 'RecipeDifficulties' })

export enum RecipeCategories {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  SNACK = 'SNACK',
  DINER = 'DINER',
}
registerEnumType(RecipeCategories, { name: 'RecipeCategories' })

export enum RecipeRestrictions {
  GLUTEN = 'GLUTEN',
  VEGAN = 'VEGAN',
  VEGGIE = 'VEGGIE',
  LACTOSE = 'LACTOSE',
}
registerEnumType(RecipeRestrictions, { name: 'RecipeRestrictions' })

export enum RecipePreparationTimes {
  PREPARATION_15 = 'PREPARATION_15',
  PREPARATION_30 = 'PREPARATION_30',
  PREPARATION_40 = 'PREPARATION_40',
  PREPARATION_45 = 'PREPARATION_45',
}
registerEnumType(RecipePreparationTimes, { name: 'RecipePreparationTimes' })

@ObjectType()
export class RecipeEdge {
  @Field(() => Recipe)
  node: Recipe
  @Field(() => ID)
  cursor: string
}

@ObjectType()
export class RecipeConnection {
  @Field(() => [RecipeEdge])
  edges: RecipeEdge[]
  @Field(() => Aggregate)
  aggregate: Aggregate
  @Field(() => PageInfo)
  pageInfo: PageInfo
}
