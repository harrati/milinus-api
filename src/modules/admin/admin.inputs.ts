import { InputType, ArgsType, Field, ID, Int } from '@nestjs/graphql'
import { ValidateNested, IsEmail, MinLength, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { AdminRoles } from './admin.types'

@InputType()
export class AdminWhereUniqueInput {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class AdminWhereInput {
  @Field({ nullable: true })
  search?: string
}

@ArgsType()
export class AdminArgs {
  @Field(() => ID)
  uuid: string
}

@InputType()
export class AdminUpdateDataInput {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  firstName?: string
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  lastName?: string
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string
  @Field(() => AdminRoles, { nullable: true })
  role?: AdminRoles
  lastLogin?: Date
}

@ArgsType()
export class CreateAdminArgs {
  @Field(() => ID, { nullable: true })
  uuid?: string
  @Field()
  @MinLength(3)
  firstName: string
  @Field()
  @MinLength(3)
  lastName: string
  @Field()
  @IsEmail()
  email: string
  @Field(() => AdminRoles)
  role: AdminRoles
  resetPasswordToken: string
}

@ArgsType()
export class AdminUpdateArgs {
  @Field(() => AdminWhereUniqueInput)
  @ValidateNested({ each: true })
  @Type(() => AdminWhereUniqueInput)
  where: AdminWhereUniqueInput

  @Field(() => AdminUpdateDataInput)
  @ValidateNested({ each: true })
  @Type(() => AdminUpdateDataInput)
  data: AdminUpdateDataInput
}

@ArgsType()
export class AdminsArgs {
  @Field(() => AdminWhereInput, { nullable: true })
  where?: AdminWhereInput

  @Field(() => ID, { nullable: true })
  after?: string

  @Field(() => Int, { nullable: true })
  first?: number

  @Field(() => Int, { nullable: true })
  last?: number

  @Field(() => ID, { nullable: true })
  before?: string
}
