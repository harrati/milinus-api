import { Module, Global } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { ReposService } from './repos.service'
import { ProgramModule } from './program/program.module'
import { TrainingModule } from './training/training.module'
import { GroupModule } from './group/group.module'
import { GroupExerciseModule } from './groupExercise/groupExercise.module'
import { ExerciseModule } from './exercise/exercise.module'
import { AdminModule } from './admin/admin.module'
import { UserProgramModule } from './userProgram/userProgram.module'
import { UserTrainingModule } from './userTraining/userTraining.module'
import { UserEvaluationModule } from './userEvaluation/userEvaluation.module'
import { TrainingReportModule } from './trainingReport/trainingReport.module'
import { NotificationModule } from './notification/notification.module'
import { SystemModule } from './system/system.module'
import { PlanetModule } from './planet/planet.module'
import { EvolutionModule } from './evolution/evolution.module'
import { EvaluationModule } from './evaluation/evaluation.module'
import { RecipeModule } from './recipe/recipe.module'
import { UserRequestModule } from './userRequest/userRequest.module'
import { TrainingGroupModule } from './trainingGroup/trainingGroup.module'
import { StoryModule } from './story/story.module'
import { RunningModule } from './running/running.module'
import { RankingModule } from './ranking/ranking.module'
import { FollowModule } from './follow/follow.module'
import { MediaModule } from './media/media.module'
import { ReportModule } from './report/report.module'
import { CommentModule } from './comment/comment.module'
import { PostModule } from './post/post.module'

@Global()
@Module({
  imports: [
    UserModule,
    ProgramModule,
    TrainingModule,
    TrainingGroupModule,
    GroupModule,
    GroupExerciseModule,
    ExerciseModule,
    AdminModule,
    UserProgramModule,
    UserTrainingModule,
    UserEvaluationModule,
    TrainingReportModule,
    NotificationModule,
    SystemModule,
    PlanetModule,
    EvolutionModule,
    EvaluationModule,
    RecipeModule,
    UserRequestModule,
    StoryModule,
    RunningModule,
    RankingModule,
    FollowModule,
    MediaModule,
    ReportModule,
    CommentModule,
    PostModule,
  ],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
