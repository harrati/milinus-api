import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  Column,
  Generated,
} from 'typeorm'
import { User } from '../user/user.entity'

@Entity()
@Index(['follower', 'following'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  uuid!: string

  @ManyToOne(() => User, user => user.followings, { onDelete: 'CASCADE' })
  follower!: User

  @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
  following!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
