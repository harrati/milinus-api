import { Module } from '@nestjs/common'
import { ExerciseResolver } from './exercise.resolver'
import { ExerciseService } from './exercise.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Exercise } from './exercise.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  providers: [ExerciseService, ExerciseResolver, ExerciseResolver],
  exports: [TypeOrmModule.forFeature([Exercise]), ExerciseService],
})
export class ExerciseModule {}
