import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeepPartial } from 'typeorm'
import { UserEvaluation } from './userEvaluation.entity'

@Injectable()
export class UserEvaluationService {
  constructor(
    @InjectRepository(UserEvaluation)
    public readonly userProgramRepository: Repository<UserEvaluation>
  ) {}

  async create(userEvaluation: DeepPartial<UserEvaluation>) {
    const createdEvaluation = this.userProgramRepository.create(userEvaluation)
    const savedEvaluation = this.userProgramRepository.save(createdEvaluation)
    return savedEvaluation
  }
}
