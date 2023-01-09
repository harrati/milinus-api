import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { User } from '../user/user.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { MediaTypes } from './media.types'
import { Story } from '../story/story.entity'
import { Post } from '../post/post.entity'

@Entity()
@ObjectType()
export class Media {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  url!: string

  @Column({ type: 'enum', enum: MediaTypes })
  @Field(() => MediaTypes)
  type!: MediaTypes

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  mute!: boolean

  @OneToMany(() => Story, story => story.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  story: Story

  @OneToOne(() => Post, post => post.media, {
    onDelete: 'CASCADE',
  })
  post: Post

  @ManyToOne(() => User, user => user.medias, { onDelete: 'CASCADE' })
  @Field(() => User)
  user!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  updatedAt!: Date
}
