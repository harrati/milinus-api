import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { AdminRoles } from './admin.types'
import { Nullable } from '../../utils/types'

@Entity()
@ObjectType()
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'uuid' })
  @Generated('uuid')
  @Index()
  @Field(() => ID)
  uuid!: string

  @Column({ type: 'varchar' })
  @Field()
  firstName!: string

  @Column({ type: 'varchar' })
  @Field()
  lastName!: string

  @Column({ type: 'varchar' })
  @Index({ unique: true })
  @Field()
  email!: string

  @Column({ type: 'varchar', nullable: true })
  password: string

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken?: Nullable<string>

  @Column({ type: 'enum', enum: AdminRoles })
  @Field(() => AdminRoles)
  role!: AdminRoles

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Field(() => Date, { nullable: true })
  lastLogin: Date

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Field(() => Date)
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date
}
