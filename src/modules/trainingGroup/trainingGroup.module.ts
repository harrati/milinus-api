import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingGroup } from './trainingGroup.entity'
import { TrainingGroupService } from './trainingGroup.service'
import { TrainingGroupResolver } from './trainingGroup.resolver'
import { TrainingGroupLoader } from './trainingGroup.loader'
import { GroupExerciseModule } from '../groupExercise/groupExercise.module'
import { GroupModule } from '../group/group.module'
import { TrainingModule } from '../training/training.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingGroup]),
    GroupExerciseModule,
    GroupModule,
    TrainingModule,
  ],
  providers: [TrainingGroupService, TrainingGroupResolver, TrainingGroupLoader],
  exports: [TrainingGroupService],
})
export class TrainingGroupModule {}
