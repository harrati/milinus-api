import { Field, ID, InputType, ArgsType, Int } from '@nestjs/graphql'
import { MaxLength, IsOptional } from 'class-validator'
import {
  RecipeDifficulties,
  RecipeCategories,
  RecipePreparationTimes,
  RecipeRestrictions,
} from './recipe.types'
import { ToggleStatus, OrderByDirection } from '../../utils/types'

@InputType()
export class RecipesWhereInput {
  @Field({ nullable: true })
  search: string
  @Field(() => [RecipeDifficulties], { nullable: true })
  difficulty: RecipeDifficulties[]
  @Field(() => [RecipeCategories], { nullable: true })
  category: RecipeCategories[]
  @Field(() => [RecipePreparationTimes], { nullable: true })
  preparationTime: RecipePreparationTimes[]
  @Field(() => [RecipeRestrictions], { nullable: true })
  restrictions: RecipeRestrictions[]
  @Field(() => ToggleStatus, { nullable: true })
  status: ToggleStatus
}

@InputType()
export class RecipeWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class RecipeUpdateInput {
  @Field({ nullable: true })
  pictureUrl: string
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  name: string
  @Field({ nullable: true })
  ingredients: string
  @Field({ nullable: true })
  description: string
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  nameEn: string
  @Field({ nullable: true })
  ingredientsEn: string
  @Field({ nullable: true })
  descriptionEn: string
  @Field(() => RecipeDifficulties, { nullable: true })
  difficulty: RecipeDifficulties
  @Field(() => RecipeCategories, { nullable: true })
  category: RecipeCategories
  @Field(() => [RecipeRestrictions], { nullable: true })
  restrictions: RecipeRestrictions[]
  @Field(() => RecipePreparationTimes, { nullable: true })
  preparationTime: RecipePreparationTimes
  @Field({ nullable: true })
  videoUrl: string
  @Field(() => ToggleStatus, { nullable: true })
  status: ToggleStatus
}

@ArgsType()
export class RecipeArgs {
  @Field(() => ID)
  uuid: string
}

@ArgsType()
export class RecipesArgs {
  @Field(() => RecipesWhereInput)
  where: RecipesWhereInput
  @Field(() => Int, { nullable: true })
  first: number
  @Field(() => ID, { nullable: true })
  after: string
  @Field(() => OrderByDirection, { nullable: true })
  order: OrderByDirection
}

@ArgsType()
export class CreateRecipesArgs {
  @Field(() => ID, { nullable: true })
  uuid: string
  @Field()
  pictureUrl: string
  @Field()
  @MaxLength(100)
  name: string
  @Field()
  ingredients: string
  @Field()
  description: string
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  nameEn: string
  @Field({ nullable: true })
  ingredientsEn: string
  @Field({ nullable: true })
  descriptionEn: string
  @Field(() => RecipeDifficulties)
  difficulty: RecipeDifficulties
  @Field(() => RecipeCategories)
  category: RecipeCategories
  @Field(() => [RecipeRestrictions], { nullable: true })
  restrictions: RecipeRestrictions[]
  @Field(() => RecipePreparationTimes)
  preparationTime: RecipePreparationTimes
  @Field({ nullable: true })
  videoUrl: string
  @Field(() => ToggleStatus)
  status: ToggleStatus
}

@ArgsType()
export class UpdateRecipesArgs {
  @Field(() => RecipeWhereUniqueInput)
  where: RecipeWhereUniqueInput
  @Field(() => RecipeUpdateInput)
  data: RecipeUpdateInput
}
