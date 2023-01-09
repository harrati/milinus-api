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
} from 'typeorm'
import { User } from '../user/user.entity'
import { Story } from '../story/story.entity'
import { Report } from '../report/report.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Post } from '../post/post.entity'

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  content!: string

  @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
  @Field(() => User, { nullable: true })
  user!: User

  @ManyToOne(() => Story, story => story.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => Story, { nullable: true })
  story?: Story

  @ManyToOne(() => Post, post => post.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => Post, { nullable: true })
  post?: Post

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
