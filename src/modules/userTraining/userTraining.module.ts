import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserTrainingService } from './userTraining.service'
import { UserTrainingResolver } from './userTraining.resolver'
import { UserTraining } from './userTraining.entity'
import { UserTrainingLoader } from './userTraining.loader'

@Module({
  imports: [TypeOrmModule.forFeature([UserTraining])],
  providers: [UserTrainingService, UserTrainingResolver, UserTrainingLoader],
  exports: [UserTrainingService],
})
export class UserTrainingModule {}
