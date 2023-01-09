import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm'
import { UserPlanet } from './userPlanet.entity'
import { System } from '../system/system.entity'
import { ObjectType, ID, Field } from '@nestjs/graphql'

@Entity()
@ObjectType()
export class Planet {
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

  @Column({ type: 'varchar' })
  @Field()
  nameEn!: string

  @Column({ type: 'varchar' })
  @Field()
  description!: string

  @Column({ type: 'varchar' })
  @Field()
  descriptionEn!: string

  @Field(() => String)
  nameTrans: string

  @Field(() => String)
  descriptionTrans: string

  @Column({ type: 'varchar' })
  @Field()
  icon!: string

  @Field(() => Boolean, { nullable: true })
  unlocked: boolean

  @Column({ type: 'boolean', default: false })
  initSystemFlag!: boolean

  @OneToMany(() => UserPlanet, userPlanet => userPlanet.planet)
  userPlanets!: UserPlanet[]

  @ManyToOne(() => System, system => system.planets)
  system!: System

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
