import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { PlaceUser } from './placeUser.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { PlaceCategories } from './place.types'
import { Coordinate } from '../../utils/types'

@Entity()
@ObjectType()
export class Place {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  name!: string

  @Column({ type: 'enum', enum: PlaceCategories })
  @Field(() => PlaceCategories)
  category!: PlaceCategories

  @Column({ type: 'simple-json' })
  @Field(() => Coordinate)
  coordinates!: Coordinate

  @Field(() => Boolean)
  isRegistered: boolean

  @OneToMany(() => PlaceUser, placeUser => placeUser.place)
  userPlaces: PlaceUser[]

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
