import { Field, ArgsType } from '@nestjs/graphql'

@ArgsType()
export class SignInArgs {
  @Field()
  email: string
  @Field()
  password: string
}

@ArgsType()
export class SignInAdminArgs {
  @Field() email: string
  @Field() password: string
}

import {
  IsEmail,
  Matches,
  MinLength,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

const minLength = 2

export const IsEqualsTo = (
  property: string,
  validationOptions?: ValidationOptions
) => (object: Record<string, any>, propertyName: string) => {
  registerDecorator({
    name: 'isEqualsTo',
    target: object.constructor,
    propertyName: propertyName,
    constraints: [property],
    // @ts-ignore
    options: { message: `${propertyName} don't match`, ...validationOptions },
    validator: {
      validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints
        const relatedValue = (args.object as any)[relatedPropertyName]
        return (
          typeof value === 'string' &&
          typeof relatedValue === 'string' &&
          value === relatedValue
        )
      },
    },
  })
}

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/

@ArgsType()
export class SignUpArgs {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @Matches(passwordPattern)
  password: string

  @Field()
  @IsEqualsTo('password')
  confirmPassword: string

  @Field()
  @MinLength(minLength)
  firstName: string

  @Field()
  @MinLength(minLength)
  lastName: string

  @Field()
  @MinLength(5)
  userName: string
}

@ArgsType()
export class ForgotPasswordArgs {
  @Field()
  @IsEmail()
  email: string
}

@ArgsType()
export class ResetPasswordArgs {
  @Field()
  resetPasswordToken: string

  @Matches(passwordPattern)
  @Field()
  password: string

  @Field()
  @IsEqualsTo('password')
  confirmPassword: string
}

@ArgsType()
export class SignInWithFacebookArgs {
  @Field() userAccessToken: string
}

@ArgsType()
export class SignInWithAppleArgs {
  @Field() authorizationCode: string
  @Field() appleId: string
  @Field({ nullable: true }) firstName?: string
  @Field({ nullable: true }) lastName?: string
}
