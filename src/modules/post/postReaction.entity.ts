import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm'
import { User } from '../user/user.entity'
import { Post } from './post.entity'
import { ReactionType } from '../story/story.types'

@Entity()
@Unique(['user', 'reaction', 'post'])
export class PostReaction {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'enum', enum: ReactionType })
  reaction!: ReactionType

  @ManyToOne(() => User, user => user.reactions)
  user!: User

  @ManyToOne(() => Post, post => post.reactions, { onDelete: 'CASCADE' })
  post: Post

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
