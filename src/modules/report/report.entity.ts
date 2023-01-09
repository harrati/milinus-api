import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm'
import { User } from '../user/user.entity'
import { Story } from '../story/story.entity'
import { Comment } from '../comment/comment.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { ReportCategories, ReportStatus } from './report.types'
import { Post } from '../post/post.entity'

@Entity()
@ObjectType()
@Unique(['user', 'story'])
@Unique(['user', 'comment'])
export class Report {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'enum', enum: ReportCategories })
  @Field(() => ReportCategories)
  category!: ReportCategories

  @Column({ type: 'enum', enum: ReportStatus })
  @Field(() => ReportStatus)
  status!: ReportStatus

  @Field(() => User, { nullable: true })
  userReported!: User

  @Field(() => Number)
  numberOfReportsByUser!: number

  @ManyToOne(() => User, user => user.reports, { onDelete: 'CASCADE' })
  @Field(() => User)
  user!: User

  @ManyToOne(() => Story, story => story.reports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Story, { nullable: true })
  story?: Story

  @ManyToOne(() => Post, post => post.reports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Post, { nullable: true })
  post?: Post

  @ManyToOne(() => Comment, comment => comment.reports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Comment, { nullable: true })
  comment?: Comment

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
