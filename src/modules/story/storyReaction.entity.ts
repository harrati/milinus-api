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
import { Story } from './story.entity'
import { ReactionType } from './story.types'

@Entity()
@Unique(['user', 'reaction', 'story'])
export class StoryReaction {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'enum', enum: ReactionType })
  reaction!: ReactionType

  @ManyToOne(() => User, user => user.reactions)
  user!: User

  @ManyToOne(() => Story, story => story.reactions, { onDelete: 'CASCADE' })
  story: Story

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
