import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GroupExerciseService } from './groupExercise.service'
import { GroupExercise } from './groupExercise.entity'
import { GroupExerciseLoader } from './groupExercise.loader'
import { GroupExerciseResolver } from './groupExercise.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([GroupExercise])],
  providers: [GroupExerciseService, GroupExerciseLoader, GroupExerciseResolver],
  exports: [GroupExerciseService],
})
export class GroupExerciseModule {}
