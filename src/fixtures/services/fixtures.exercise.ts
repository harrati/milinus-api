import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository, ObjectLiteral } from 'typeorm'
import { Exercise } from '../../modules/exercise/exercise.entity'
import {
  TrainingEquipments,
  BodyAreas,
  UserTrainingFrequencies,
} from '../../modules/profile/profile.types'
import {
  ExerciseTypes,
  ExerciseFormat,
  ExerciseReferences,
} from '../../modules/exercise/exercise.types'
import exercises from '../data/exercises.json'

const arrayToScaleRule = (array: number[]) => {
  const [start, end, step] = array
  return {
    start,
    end,
    step,
  }
}

export const typesMapper: ObjectLiteral = {
  ['BODYBUILDING']: ExerciseTypes.BODYBUILDING,
  ['FITNESS']: ExerciseTypes.FITNESS,
  ['PILATE']: ExerciseTypes.PILATE,
  ['STRETCHING']: ExerciseTypes.STRETCHING,
  ['RUNNING']: ExerciseTypes.RUNNING,
}

export const referenceMapper: ObjectLiteral = {
  ['DEADLIFT']: ExerciseReferences.DEADLIFT,
  ['ROWING']: ExerciseReferences.ROWING,
  ['DVC']: ExerciseReferences.DVC,
  ['SQUAT']: ExerciseReferences.SQUAT,
}

export const formatMapper: ObjectLiteral = {
  ['DISTANCE']: ExerciseFormat.METER,
  ['REPETITION']: ExerciseFormat.REPETITION,
  ['TIME']: ExerciseFormat.TIME,
}

export const equipmentsMapper: ObjectLiteral = {
  ['BENCH']: TrainingEquipments.BENCH,
  ['DRAW_BAR']: TrainingEquipments.DRAW_BAR,
  ['DUMBBELL']: TrainingEquipments.DUMBBELL,
  ['NONE']: TrainingEquipments.NONE,
  ['WEIGHT_BAR']: TrainingEquipments.WEIGHT_BAR,
}

export const difficultyMapper: ObjectLiteral = {
  ['NOOB']: UserTrainingFrequencies.NOOB,
  ['FREQUENTLY']: UserTrainingFrequencies.FREQUENTLY,
  ['OFTEN']: UserTrainingFrequencies.OFTEN,
  ['WAR_MACHINE']: UserTrainingFrequencies.WAR_MACHINE,
}

export const bodyAreasMapper: ObjectLiteral = {
  ['ASS']: BodyAreas.ASS,
  ['THIGH']: BodyAreas.THIGH,
  ['ABS']: BodyAreas.ABS,
  ['BACK']: BodyAreas.BACK,
  ['CHEST']: BodyAreas.CHEST,
  ['ARMS']: BodyAreas.ARMS,
  ['SHOULDERS']: BodyAreas.SHOULDERS,
  ['FULL_BODY']: BodyAreas.FULL_BODY,
  ['CARDIO']: BodyAreas.CARDIO,
}

@Injectable()
export class FixturesExerciseService {
  private readonly repository: Repository<Exercise>

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {
    this.repository = connection.getRepository(Exercise)
  }

  injectExercises(): Promise<Exercise[]> {
    console.log('seeding exercises...')
    const toCreate = exercises.map(exercise => {
      const {
        id,
        scale1,
        scale2,
        scale3,
        scale4,
        initialDifficulty,
        maxNumber,
        equipments,
        type,
        format,
        reference,
        difficulty,
        primaryBodyArea,
        secondaryBodyArea,
        tertiaryBodyArea,
        secondaryFormat,
        photoUrl,
        videoUrl,
        gifUrl,
        initialDifficulty2,
        maxNumber2,
        scale21,
        scale22,
        scale23,
        scale24,
        ...other
      } = exercise

      const difficultyScale = [
        {
          initialDifficulty,
          maxNumber,
          format: formatMapper[format],
          difficultyScaleRules: [
            arrayToScaleRule(scale1),
            arrayToScaleRule(scale2),
            arrayToScaleRule(scale3),
            arrayToScaleRule(scale4),
          ],
        },
      ]
      if (secondaryFormat) {
        difficultyScale.push({
          ...(initialDifficulty2 && {
            initialDifficulty: initialDifficulty2,
            maxNumber: maxNumber2,
            format: formatMapper[secondaryFormat],
            difficultyScaleRules: [
              arrayToScaleRule(scale21),
              arrayToScaleRule(scale22),
              arrayToScaleRule(scale23),
              arrayToScaleRule(scale24),
            ],
          }),
        })
      }
      return this.repository.create({
        ...other,
        secretId: id,
        pictureUrl: photoUrl,
        videoUrl: videoUrl,
        gifUrl: gifUrl,
        primaryBodyArea: primaryBodyArea && bodyAreasMapper[primaryBodyArea],
        secondaryBodyArea:
          secondaryBodyArea && bodyAreasMapper[secondaryBodyArea],
        tertiaryBodyArea: tertiaryBodyArea && bodyAreasMapper[tertiaryBodyArea],
        equipments: equipmentsMapper[equipments]
          ? [equipmentsMapper[equipments]]
          : [],
        difficulty: difficultyMapper[difficulty],
        type: typesMapper[type],
        reference: referenceMapper && referenceMapper[reference],
        format: formatMapper[format],
        secondaryFormat: formatMapper[secondaryFormat],
        difficultyScale,
      })
    })
    return this.repository.save(toCreate)
  }
}
