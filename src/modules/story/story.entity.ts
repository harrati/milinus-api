import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import { User } from '../user/user.entity'
import { StoryReaction } from './storyReaction.entity'
import { Comment } from '../comment/comment.entity'
import { Report } from '../report/report.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Media } from '../media/media.entity'
import { StoryView } from './storyView.entity'
import { Reactions } from './story.types'
import { Post } from '../post/post.entity'

@Entity()
@ObjectType()
export class Story {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'boolean', default: false })
  expired!: boolean

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  description: string

  @ManyToOne(() => User, user => user.stories, { onDelete: 'CASCADE' })
  @Field(() => User)
  user!: User

  @ManyToOne(() => Media, media => media.story, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Field(() => Media)
  media: Media

  @OneToMany(() => StoryReaction, storyReaction => storyReaction.story)
  reactions: StoryReaction[]

  @OneToMany(() => Comment, comment => comment.story)
  comments: Comment[]

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @OneToMany(() => StoryView, storyView => storyView.story)
  views: StoryView[]

  @Field(() => Boolean)
  seen!: boolean

  @Field(() => Reactions, { name: 'reactions' })
  reactionsCount: Reactions

  @OneToOne(() => Post, post => post.story, {
    onDelete: 'CASCADE',
  })
  post: Post

  @Column()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
