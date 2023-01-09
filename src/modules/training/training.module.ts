import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingResolver } from './training.resolver'
import { TrainingService } from './training.service'
import { Training } from './training.entity'
import { TrainingLoader } from './training.loader'
import { GroupExerciseModule } from '../groupExercise/groupExercise.module'

@Module({
  imports: [TypeOrmModule.forFeature([Training]), GroupExerciseModule],
  providers: [TrainingService, TrainingResolver, TrainingLoader],
  exports: [TrainingService],
})
export class TrainingModule {}
