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
import { Planet } from '../planet/planet.entity'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Program } from '../program/program.entity'

@Entity()
@ObjectType()
export class System {
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
  icon!: string

  @Field(() => Number)
  uses!: number

  @OneToMany(() => Planet, planet => planet.system)
  @Field(() => [Planet])
  planets!: Planet[]

  @OneToMany(() => Program, program => program.system)
  @Field(() => [Program])
  programs: Program[]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
