import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { UserRecipe } from './userRecipes.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { ToggleStatus } from '../../utils/types'
import {
  RecipePreparationTimes,
  RecipeRestrictions,
  RecipeCategories,
  RecipeDifficulties,
} from './recipe.types'

@Entity()
@ObjectType()
export class Recipe {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  name!: string

  @Column({ type: 'varchar' })
  @Field()
  ingredients!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  nameEn: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  descriptionEn: string

  @Field(() => String)
  nameTrans: string

  @Field(() => String)
  descriptionTrans: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  ingredientsEn: string

  @Column({ type: 'varchar' })
  @Field()
  pictureUrl!: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  thumbnailPictureUrl: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  videoUrl: string

  @Column({ type: 'varchar' })
  @Field()
  description!: string

  @Column({ type: 'enum', enum: RecipeDifficulties })
  @Field(() => RecipeDifficulties)
  difficulty!: RecipeDifficulties

  @Column({ type: 'enum', enum: RecipeCategories })
  @Field(() => RecipeCategories)
  category!: RecipeCategories

  @Column({ type: 'enum', array: true, default: [], enum: RecipeRestrictions })
  @Field(() => [RecipeRestrictions], { nullable: true })
  restrictions: RecipeRestrictions[]

  @Column({ type: 'enum', enum: RecipePreparationTimes })
  @Field(() => RecipePreparationTimes)
  preparationTime!: RecipePreparationTimes

  @Column({ type: 'enum', enum: ToggleStatus })
  @Field(() => ToggleStatus)
  status!: ToggleStatus

  @Field(() => Boolean)
  hasCooked: boolean

  @OneToMany(() => UserRecipe, userRecipe => userRecipe.recipe)
  userRecipes: UserRecipe[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
