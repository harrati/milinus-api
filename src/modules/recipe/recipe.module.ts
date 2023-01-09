import { RecipeService } from './recipe.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Recipe } from './recipe.entity'
import { RecipeResolver } from './recipe.resolver'
import { UserRecipe } from './userRecipes.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, UserRecipe])],
  providers: [RecipeService, RecipeResolver],
  exports: [RecipeService],
})
export class RecipeModule {}
