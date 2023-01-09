import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { User } from '../user/user.entity'
import { Place } from './place.entity'

@Entity()
export class PlaceUser {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Place, place => place.userPlaces)
  place!: Place

  @ManyToOne(() => User, user => user.places, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
