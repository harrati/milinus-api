import { Module } from '@nestjs/common'
import { FixturesService } from './fixtures.service'
import { FixturesAdminService } from './services/fixtures.admin'
import { FixturesCommentService } from './services/fixtures.comment'
import { FixturesEvolutionService } from './services/fixtures.evolution'
import { FixturesExerciseService } from './services/fixtures.exercise'
import { FixturesFollowService } from './services/fixtures.follow'
import { FixturesMediaService } from './services/fixtures.media'
import { FixturesNotificationService } from './services/fixtures.notification'
import { FixturesPlaceService } from './services/fixtures.place'
import { FixturesPlanetService } from './services/fixtures.planet'
import { FixturesProgramService } from './services/fixtures.program'
import { FixturesRecipeService } from './services/fixtures.recipe'
import { FixturesReportService } from './services/fixtures.report'
import { FixturesStoryService } from './services/fixtures.story'
import { FixturesSystemService } from './services/fixtures.system'
import { FixturesUserService } from './services/fixtures.user'
import { ConfigModule } from '@nestjs/config'
import { FixturesUserRequestService } from './services/fixtures.userRequest'
import { FixturesPostService } from './services/fixtures.post'

@Module({
  imports: [ConfigModule],
  providers: [
    FixturesService,
    FixturesAdminService,
    FixturesCommentService,
    FixturesEvolutionService,
    FixturesExerciseService,
    FixturesFollowService,
    FixturesMediaService,
    FixturesNotificationService,
    FixturesPlaceService,
    FixturesPlanetService,
    FixturesProgramService,
    FixturesRecipeService,
    FixturesReportService,
    FixturesStoryService,
    FixturesSystemService,
    FixturesUserService,
    FixturesUserRequestService,
    FixturesPostService,
  ],
})
export class FixturesModule {}
