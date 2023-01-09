import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { FixturesModule } from '../fixtures/fixtures.module'
import { FixturesService } from '../fixtures/fixtures.service'
;(async () => {
  const context = await NestFactory.createApplicationContext(AppModule)
  const fixturesModule = context.select<FixturesModule>(FixturesModule)
  const fixturesService = fixturesModule.get<FixturesService>(FixturesService)
  const config = context.get<ConfigService>(ConfigService)
  const stage = config.get('stage')

  await fixturesService.resetDatabase()
  let users = []
  const realUsers = await fixturesService.user.injectTotemUsers()
  if (stage !== 'production') {
    const fakeUsers = await fixturesService.user.injectUsers()
    users = [...realUsers, ...fakeUsers]
  }
  users = [...realUsers]

  await fixturesService.admin.injectAdmins()
  const exercises = await fixturesService.exercise.injectExercises()
  const systems = await fixturesService.system.injectSystems()
  await fixturesService.program.injectPrograms(exercises, systems)
  await fixturesService.recipe.injectRecipes(users)
  await fixturesService.planet.injectPlanets(systems, users)

  if (stage !== 'production') {
    await fixturesService.place.injectPlaces(users)
    await fixturesService.evolution.injectEvolutions(users)
    await fixturesService.follow.injectFollows(users)
    const medias = await fixturesService.media.injectMedias()
    const stories = await fixturesService.story.injectStories(users, medias)
    const posts = await fixturesService.post.injectPost(users)
    await fixturesService.story.injectStoryReactions(stories, users)
    await fixturesService.story.injectPostReactions(posts, users)
    await fixturesService.story.injectStoryView(stories, users)
    const comments = await fixturesService.comment.injectComments(
      users,
      stories
    )
    await fixturesService.comment.injectPostComments(users, posts)
    await fixturesService.report.injectReports(users, comments, stories, posts)
    // await fixturesService.userRequest.injectUserRequests(users)
    if (stage !== 'staging') {
      await fixturesService.notification.injectNotifications(
        users,
        comments,
        stories
      )
    }
  }
})()
  .then(() => {
    console.log(`Success!`)
    process.exit(0)
  })
  .catch(error => {
    console.log(error)
  })
