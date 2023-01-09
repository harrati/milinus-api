import { Injectable, Inject } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { ConfigService } from '@nestjs/config'
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
import { FixturesUserRequestService } from './services/fixtures.userRequest'
import { FixturesPostService } from './services/fixtures.post'

@Injectable()
export class FixturesService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(FixturesAdminService)
    public readonly admin: FixturesAdminService,
    @Inject(FixturesCommentService)
    public readonly comment: FixturesCommentService,
    @Inject(FixturesEvolutionService)
    public readonly evolution: FixturesEvolutionService,
    @Inject(FixturesExerciseService)
    public readonly exercise: FixturesExerciseService,
    @Inject(FixturesFollowService)
    public readonly follow: FixturesFollowService,
    @Inject(FixturesMediaService)
    public readonly media: FixturesMediaService,
    @Inject(FixturesNotificationService)
    public readonly notification: FixturesNotificationService,
    @Inject(FixturesPlaceService)
    public readonly place: FixturesPlaceService,
    @Inject(FixturesPlanetService)
    public readonly planet: FixturesPlanetService,
    @Inject(FixturesProgramService)
    public readonly program: FixturesProgramService,
    @Inject(FixturesRecipeService)
    public readonly recipe: FixturesRecipeService,
    @Inject(FixturesReportService)
    public readonly report: FixturesReportService,
    @Inject(FixturesStoryService)
    public readonly story: FixturesStoryService,
    @Inject(FixturesSystemService)
    public readonly system: FixturesSystemService,
    @Inject(FixturesUserService)
    public readonly user: FixturesUserService,
    @Inject(FixturesUserRequestService)
    public readonly userRequest: FixturesUserRequestService,
    @Inject(FixturesPostService)
    public readonly post: FixturesPostService,
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  async resetDatabase() {
    console.log('Sync database...')
    const qr = this.connection.createQueryRunner()
    await qr.clearDatabase()
    await this.connection.synchronize()
  }
}
