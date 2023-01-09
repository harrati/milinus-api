import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserProgram } from './userProgram.entity'
import { UserProgramResolver } from './userProgram.resolver'
import { UserProgramService } from './userProgram.service'
import { UserProgramLoader } from './userProgram.loader'
import { UserTrainingModule } from '../userTraining/userTraining.module'
import { ProgramModule } from '../program/program.module'
import { TrainingReportModule } from '../trainingReport/trainingReport.module'
import { TrainingModule } from '../training/training.module'
import { TrainingGroupModule } from '../trainingGroup/trainingGroup.module'
import { GroupExerciseModule } from '../groupExercise/groupExercise.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProgram]),
    ProgramModule,
    TrainingReportModule,
    TrainingModule,
    TrainingGroupModule,
    GroupExerciseModule,
    forwardRef(() => UserTrainingModule),
  ],
  providers: [UserProgramService, UserProgramResolver, UserProgramLoader],
  exports: [UserProgramService],
})
export class UserProgramModule {}
