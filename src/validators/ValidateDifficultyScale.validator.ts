import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'
import { isInteger } from 'lodash'
import { DifficultyScale } from '../modules/exercise/exercise.types'

export function ValidateDifficultyScale(
  property?: string,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'ValidateDifficultyScale',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      // @ts-ignore
      options: {
        message: `DifficultyScale not passing validation, end must be less then maxNumber, start must be less then end, start to end must be in steps`,
        ...validationOptions,
      },
      validator: {
        validate(value: DifficultyScale[], args: ValidationArguments) {
          for (const singleValue of value) {
            const {
              initialDifficulty,
              maxNumber,
              difficultyScaleRules,
            } = singleValue
            for (const rules of difficultyScaleRules) {
              const { start, end, step } = rules
              if (start > end) return false
              if (!isInteger((end - start) / step)) return false
              if (end > maxNumber) return false
            }
          }
          return true
        },
      },
    })
  }
}
