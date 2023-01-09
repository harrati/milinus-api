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
import { Field, ObjectType, ID, Float } from '@nestjs/graphql'

@Entity()
@ObjectType()
export class Evolution {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  pictureUrl!: string

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  watermarkedPictureUrl!: string

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Field(() => Float)
  weight!: number

  @ManyToOne(() => User, user => user.evolutions, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
