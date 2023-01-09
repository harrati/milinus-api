import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'
import { isUndefined } from 'lodash'

export const IsPropertyValue = (
  property: string,
  propertyValue: string,
  validationOptions?: ValidationOptions
) => (object: Record<string, any>, propertyName: string) => {
  registerDecorator({
    name: 'IsPropertyValue',
    target: object.constructor,
    propertyName: propertyName,
    constraints: [property],
    // @ts-ignore
    options: {
      message: `${property} must have value ${propertyValue} for ${propertyName} to be set`,
      ...validationOptions,
    },
    validator: {
      validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints
        const relatedValue = (args.object as any)[relatedPropertyName]
        return !isUndefined(relatedValue) && relatedValue === propertyValue
      },
    },
  })
}
