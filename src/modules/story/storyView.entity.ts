import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm'
import { User } from '../user/user.entity'
import { Story } from './story.entity'

@Entity()
@Unique('US_UNIQUE', ['user', 'story'])
export class StoryView {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, user => user.views, { onDelete: 'CASCADE' })
  user!: User

  @ManyToOne(() => Story, story => story.views, { onDelete: 'CASCADE' })
  story: Story

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
