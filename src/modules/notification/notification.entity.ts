import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { User } from '../user/user.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { NotificationTypes, NotificationStatus } from './notification.types'
import { Story } from '../story/story.entity'
import { Post } from '../post/post.entity'
import { Comment } from '../comment/comment.entity'

@Entity()
@ObjectType()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  route?: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  title: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  body: string

  @Column({ type: 'enum', enum: NotificationTypes })
  @Field(() => NotificationTypes)
  type!: NotificationTypes

  @Column({ type: 'enum', enum: NotificationStatus })
  @Field(() => NotificationStatus)
  status!: NotificationStatus

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  user!: User

  @ManyToOne(() => User, user => user.authors, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  author?: User

  @ManyToOne(() => Story, { nullable: true, onDelete: 'CASCADE' })
  @Field(() => Story, { nullable: true })
  story?: Story

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @Field(() => Comment, { nullable: true })
  comment?: Comment

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  @Field(() => Post, { nullable: true })
  post?: Post

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}

@Entity()
@ObjectType()
export class ScheduledNotification {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  title!: string

  @Column({ type: 'varchar' })
  @Field()
  content!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  titleEn: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  contentEn: string

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  route?: string

  @Column({ type: 'boolean', default: false })
  sent: boolean

  // FIXME: not working with timezone
  @Column()
  @Field(() => Date)
  scheduledAt!: Date

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}

@Entity()
@ObjectType()
export class PushToken {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  token!: string

  @ManyToOne(() => User, user => user.pushTokens, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
