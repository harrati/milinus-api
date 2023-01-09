import { Injectable, Inject } from '@nestjs/common'
import { UserService } from './user/user.service'
import { ProgramService } from './program/program.service'
import { TrainingService } from './training/training.service'
import { GroupService } from './group/group.service'
import { GroupExerciseService } from './groupExercise/groupExercise.service'
import { ExerciseService } from './exercise/exercise.service'
import { AdminService } from './admin/admin.service'
import { UserProgramService } from './userProgram/userProgram.service'
import { UserTrainingService } from './userTraining/userTraining.service'
import { UserEvaluationService } from './userEvaluation/userEvaluation.service'
import { TrainingReportService } from './trainingReport/trainingReport.service'
import { NotificationService } from './notification/notification.service'
import { SystemService } from './system/system.service'
import { PlanetService } from './planet/planet.service'
import { EvolutionService } from './evolution/evolution.service'
import { EvaluationService } from './evaluation/evaluation.service'
import { RecipeService } from './recipe/recipe.service'
import { UserRequestService } from './userRequest/userRequest.service'
import { TrainingGroupService } from './trainingGroup/trainingGroup.service'
import { StoryService } from './story/story.service'
import { RunningService } from './running/running.service'
import { RankingService } from './ranking/ranking.service'
import { FollowService } from './follow/follow.service'
import { MediaService } from './media/media.service'
import { ReportService } from './report/report.service'
import { CommentService } from './comment/comment.service'
import { PostService } from './post/post.service'

@Injectable()
export class ReposService {
  public constructor(
    @Inject(UserService) public readonly user: UserService,
    @Inject(AdminService) public readonly admin: AdminService,
    @Inject(ProgramService) public readonly program: ProgramService,
    @Inject(TrainingService) public readonly training: TrainingService,
    @Inject(GroupService) public readonly group: GroupService,
    @Inject(GroupExerciseService)
    public readonly groupExercise: GroupExerciseService,
    @Inject(ExerciseService) public readonly exercise: ExerciseService,
    @Inject(UserProgramService) public readonly userProgram: UserProgramService,
    @Inject(UserTrainingService)
    public readonly userTraining: UserTrainingService,
    @Inject(UserEvaluationService)
    public readonly userEvaluation: UserEvaluationService,
    @Inject(TrainingReportService)
    public readonly trainingReport: TrainingReportService,
    @Inject(NotificationService)
    public readonly notification: NotificationService,
    @Inject(SystemService)
    public readonly system: SystemService,
    @Inject(PlanetService)
    public readonly planet: PlanetService,
    @Inject(EvolutionService)
    public readonly evolution: EvolutionService,
    @Inject(EvaluationService)
    public readonly evaluation: EvaluationService,
    @Inject(RecipeService)
    public readonly recipe: RecipeService,
    @Inject(UserRequestService)
    public readonly userRequest: UserRequestService,
    @Inject(TrainingGroupService)
    public readonly trainingGroup: TrainingGroupService,
    @Inject(StoryService)
    public readonly story: StoryService,
    @Inject(RunningService)
    public readonly running: RunningService,
    @Inject(RankingService)
    public readonly ranking: RankingService,
    @Inject(FollowService)
    public readonly follow: FollowService,
    @Inject(MediaService)
    public readonly media: MediaService,
    @Inject(ReportService)
    public readonly report: ReportService,
    @Inject(CommentService)
    public readonly comment: CommentService,
    @Inject(PostService)
    public readonly post: PostService
  ) {}
}
