import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Running } from './running.entity'
import { Repository, DeepPartial } from 'typeorm'
import { UserTraining } from '../userTraining/userTraining.entity'

@Injectable()
export class RunningService {
  constructor(
    @InjectRepository(Running)
    private readonly runningRepository: Repository<Running>
  ) {}

  async createRunning(runningPayload: DeepPartial<Running>): Promise<Running> {
    const running = this.runningRepository.create(runningPayload as DeepPartial<
      Running
    >)
    return await this.runningRepository.save(running)
  }

  async findByUserTraining(userTraining: UserTraining) {
    const runnings = await this.runningRepository.find({ userTraining })
    return runnings
  }
}
