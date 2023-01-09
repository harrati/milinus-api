import { Injectable } from '@nestjs/common'
import { Evaluation } from './evaluation.entity'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Exercise } from '../exercise/exercise.entity'
import { WhereUniqueInput } from '../../utils/types'
import { Program } from '../program/program.entity'

export type CreateEvaluationType = Pick<
  Evaluation,
  'duration' | 'program' | 'exercise'
>
export type UpdateEvaluationType = Pick<Evaluation, 'duration' | 'exercise'>

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    public readonly evaluationRepository: Repository<Evaluation>
  ) {}

  async findByUuid(uuid: string): Promise<Evaluation> {
    return await this.evaluationRepository.findOne({ uuid })
  }

  async findByProgram(program: Program): Promise<Evaluation> {
    return await this.evaluationRepository.findOne({ program })
  }

  async createEvaluation(
    evaluationPayload: DeepPartial<CreateEvaluationType>
  ): Promise<Evaluation> {
    const evaluation = this.evaluationRepository.create(
      evaluationPayload as DeepPartial<Evaluation>
    )
    return await this.evaluationRepository.save(evaluation)
  }

  async updateEvaluation(
    evaluation: WhereUniqueInput,
    payload: DeepPartial<UpdateEvaluationType>
  ): Promise<Evaluation> {
    await this.evaluationRepository.update(
      { uuid: evaluation.uuid },
      { ...(payload as DeepPartial<Evaluation>) }
    )
    const updatedEvaluation = await this.evaluationRepository.findOneOrFail({
      uuid: evaluation.uuid,
    })
    return updatedEvaluation
  }

  async getExerciseForEvaluation(evaluation: Evaluation): Promise<Exercise> {
    const { exercise } = await this.evaluationRepository.findOneOrFail(
      evaluation.id,
      {
        relations: ['exercise'],
      }
    )
    return exercise
  }
}
