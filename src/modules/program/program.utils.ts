import { intersection } from 'lodash'
import { Program } from './program.entity'
import { GroupExercise } from '../groupExercise/groupExercise.entity'
import { SelectQueryBuilder } from 'typeorm'
import { BodyAreas } from '../profile/profile.types'

const bodyAreaGroups = {
  top: [BodyAreas.ARMS, BodyAreas.BACK, BodyAreas.CHEST, BodyAreas.SHOULDERS],
  bottom: [BodyAreas.ASS, BodyAreas.THIGH],
}

const isInBodyAreaGroup = (
  group: keyof typeof bodyAreaGroups,
  userBodyAreas: BodyAreas[]
) => intersection(bodyAreaGroups[group], userBodyAreas).length > 0

export const getExtendedBodyAreas = (userBodyAreas: BodyAreas[]) => {
  if (userBodyAreas.length === 1 && userBodyAreas[0] === BodyAreas.ABS)
    return [BodyAreas.ABS, BodyAreas.FULL_BODY]

  // In v1 cardio is used as a wildcard, it may change in future version
  const extendedBodyAreas = [BodyAreas.CARDIO]
  const hasTopBodyAreas = isInBodyAreaGroup('top', userBodyAreas)
  const hasBottomBodyAreas = isInBodyAreaGroup('bottom', userBodyAreas)

  if (hasTopBodyAreas) extendedBodyAreas.push(...bodyAreaGroups.top)
  if (hasBottomBodyAreas) extendedBodyAreas.push(...bodyAreaGroups.bottom)
  if (userBodyAreas.includes(BodyAreas.ABS))
    extendedBodyAreas.push(BodyAreas.ABS)
  if (hasBottomBodyAreas && hasTopBodyAreas)
    extendedBodyAreas.push(BodyAreas.FULL_BODY)

  return extendedBodyAreas
}

export const buildProgramExerciseFilters = (
  programQb: SelectQueryBuilder<Program>,
  exerciseFilter: (
    groupExerciseQb: SelectQueryBuilder<GroupExercise>
  ) => string,
  operator: 'IN' | 'NOT IN'
) => {
  const groupExerciseQuery = programQb
    .subQuery()
    .from(GroupExercise, 'ge')
    .where(exerciseFilter)
    .innerJoin('ge.group', 'g')
    .innerJoin('g.training', 't')
    .innerJoin('t.program', 'p')
    .orderBy('p.id')
    .select('p.id')
    .distinct(true)
    .getQuery()
  return `program.id ${operator} ` + groupExerciseQuery
}
