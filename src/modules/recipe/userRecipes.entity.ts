import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { User } from '../user/user.entity'
import { Recipe } from './recipe.entity'

@Entity()
export class UserRecipe {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  uuid!: string

  @ManyToOne(() => Recipe, recipe => recipe.userRecipes, { onDelete: 'CASCADE' })
  recipe!: Recipe

  @ManyToOne(() => User, user => user.recipes, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
