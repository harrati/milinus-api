import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export const IsNotEqualTo = (
  property: string,
  validationOptions?: ValidationOptions
) => (object: Record<string, any>, propertyName: string) => {
  registerDecorator({
    name: 'IsNotEqualsTo',
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
          value !== relatedValue
        )
      },
    },
  })
}
