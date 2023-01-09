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
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../user/user.entity'
import { Comment } from '../comment/comment.entity'
import { Report } from '../report/report.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Media } from '../media/media.entity'
import { PostReaction } from './postReaction.entity'
import { PostPrivacies } from './post.types'
import { Reactions } from '../story/story.types'
import { Story } from '../story/story.entity'

@Entity()
@ObjectType()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field(() => String)
  pictureUrl!: string

  @Column({ type: 'enum', enum: PostPrivacies })
  @Field(() => PostPrivacies)
  privacy!: PostPrivacies

  @Column({ type: 'boolean', default: false })
  expired!: boolean

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  description?: string

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  @Field(() => User)
  user!: User

  @OneToOne(() => Media, media => media.post)
  @JoinColumn()
  @Field(() => Media)
  media: Media

  @OneToMany(() => PostReaction, postReaction => postReaction.post)
  reactions: PostReaction[]

  @Field(() => Reactions, { name: 'reactions' })
  reactionsCount: Reactions

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[]

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @OneToOne(() => Story, story => story.post, { onDelete: 'CASCADE' })
  @JoinColumn()
  story: Story

  @Column()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
