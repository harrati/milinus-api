import { TasksModule } from './tasks/tasks.module'
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GraphQLModule } from '@nestjs/graphql'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { config } from './config/config'
import { UserModule } from './modules/user/user.module'
import { RecipeModule } from './modules/recipe/recipe.module'
import { ExerciseModule } from './modules/exercise/exercise.module'
import { TrainingModule } from './modules/training/training.module'
import { ProgramModule } from './modules/program/program.module'
import { GroupModule } from './modules/group/group.module'
import { StoryModule } from './modules/story/story.module'
import { PlaceModule } from './modules/place/place.module'
import { CommentModule } from './modules/comment/comment.module'
import { FollowModule } from './modules/follow/follow.module'
import { AuthModule } from './modules/auth/auth.module'
import { ProfileModule } from './modules/profile/profile.module'
import { NotificationModule } from './modules/notification/notification.module'
import { SystemModule } from './modules/system/system.module'
import { RunningModule } from './modules/running/running.module'
import { EvaluationModule } from './modules/evaluation/evaluation.module'
import { EvolutionModule } from './modules/evolution/evolution.module'
import { RankingModule } from './modules/ranking/ranking.module'
import { LibsModule } from './libs/libs.module'
import { ReposModule } from './modules/repos.module'
import { LoggerMiddleware } from './middlewares'
import { GroupExerciseModule } from './modules/groupExercise/groupExercise.module'
import {
  authQueries,
  programQueries,
  systemQueries,
  evolutionQueries,
  recipeQueries,
  profileQueries,
  notificationQueries,
  evaluationQueries,
  feedQueries,
  runningQueries,
  followQueries,
  subscriptionQueries,
} from './utils/playground/'
import { AdminModule } from './modules/admin/admin.module'
import { UserProgramModule } from './modules/userProgram/userProgram.module'
import { UserTrainingModule } from './modules/userTraining/userTraining.module'
import { UserEvaluationModule } from './modules/userEvaluation/userEvaluation.module'
import { TrainingReportModule } from './modules/trainingReport/trainingReport.module'
import { ReportModule } from './modules/report/report.module'
import { MediaModule } from './modules/media/media.module'
import { PlanetModule } from './modules/planet/planet.module'
import { FixturesModule } from './fixtures/fixtures.module'
import { ScheduleModule } from '@nestjs/schedule'
import { UserRequestModule } from './modules/userRequest/userRequest.module'
import { TrainingGroupModule } from './modules/trainingGroup/trainingGroup.module'
import { PostModule } from './modules/post/post.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const endpoint = `${configService.get('url.api')}${configService.get(
          'graphql.path'
        )}`
        const headers = { ['Authorization']: 'Bearer ' }
        return {
          context: ({ req }: { req: Request }) => ({ req }),
          ...configService.get('graphql'),
          autoSchemaFile: true,
          playground: {
            workspaceName: 'milinus-api',
            tabs: [
              { name: 'Auth', query: authQueries },
              { name: 'Programs', query: programQueries },
              { name: 'System', query: systemQueries },
              { name: 'Evolution', query: evolutionQueries },
              { name: 'Evaluation', query: evaluationQueries },
              { name: 'Recipe', query: recipeQueries },
              { name: 'Profile', query: profileQueries },
              { name: 'Notification', query: notificationQueries },
              { name: 'Feed', query: feedQueries },
              { name: 'Running', query: runningQueries },
              { name: 'Follow', query: followQueries },
              { name: 'Subscription', query: subscriptionQueries },
            ].map(options => ({
              ...options,
              endpoint,
              headers,
            })),
          },
        }
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ReposModule,
    FixturesModule,
    UserModule,
    AdminModule,
    RecipeModule,
    ExerciseModule,
    TrainingModule,
    ProgramModule,
    GroupModule,
    GroupExerciseModule,
    StoryModule,
    PlaceModule,
    CommentModule,
    FollowModule,
    AuthModule,
    ProfileModule,
    NotificationModule,
    SystemModule,
    RunningModule,
    EvaluationModule,
    EvolutionModule,
    RankingModule,
    UserProgramModule,
    UserEvaluationModule,
    TrainingReportModule,
    ReportModule,
    MediaModule,
    PlanetModule,
    TrainingGroupModule,
    LibsModule,
    TasksModule,
    UserRequestModule,
    UserTrainingModule,
    PostModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/')
  }
}
