import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { Story } from './story.entity'
import { StoryConnection, Reactions } from './story.types'
import {
  StoryArgs,
  CreateStoryArgs,
  ReactStoryArgs,
  UserStoriesArgs,
  RepostArgs,
} from './story.inputs'
import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { UseGuards } from '@nestjs/common'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { StoryLoader } from './story.loader'
import { UserConnection } from '../user/user.types'
import { WhereUniqueArgs } from '../../utils/types'
import { Media } from '../media/media.entity'

@UseGuards(AuthGuard)
@Resolver(() => Story)
export class StoryResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: StoryLoader
  ) {}

  @Query(() => Story)
  story(@Args() args: StoryArgs): Promise<Story> {
    return this.repos.story.findByUuid(args.uuid)
  }

  @Query(() => UserConnection)
  stories(@CurrentUser() user: User): Promise<UserConnection> {
    return this.repos.story.getStories(user)
  }

  @Query(() => StoryConnection)
  userStories(@Args() args: UserStoriesArgs): Promise<StoryConnection> {
    const { where } = args
    return this.repos.story.getUserStoriesConnection(where.uuid)
  }

  @Mutation(() => [Story])
  createStory(
    @CurrentUser() user: User,
    @Args() args: CreateStoryArgs
  ): Promise<Story[]> {
    return this.repos.story.createStory(args, user)
  }

  @Mutation(() => Story)
  async reactStory(
    @CurrentUser() user: User,
    @Args() args: ReactStoryArgs
  ): Promise<Story> {
    const { where, data } = args
    const story = await this.repos.story.findByUuid(where.uuid)
    if (story.post) {
      this.repos.post.createReaction(story.post, data, user, false)
    }
    return this.repos.story.createReaction(story, data, user, true)
  }

  @Mutation(() => Story)
  playStory(
    @CurrentUser() user: User,
    @Args() args: StoryArgs
  ): Promise<Story> {
    return this.repos.story.seeStory(args.uuid, user)
  }

  @Mutation(() => Story)
  repost(@CurrentUser() user: User, @Args() args: RepostArgs): Promise<Story> {
    const { storyUuid, postUuid } = args
    if ((!storyUuid && !postUuid) || (storyUuid && postUuid))
      throw new Error('invalid-input')

    if (storyUuid) {
      return this.repos.story.repostStory(args.storyUuid, user)
    }
    return this.repos.story.repostStory(args.postUuid, user)
  }

  @Mutation(() => Boolean)
  deleteStory(
    @CurrentUser() user: User,
    @Args() args: WhereUniqueArgs
  ): Promise<boolean> {
    return this.repos.story.deleteFromUser(args.uuid, user)
  }

  @ResolveField('seen', () => Boolean)
  async seen(
    @CurrentUser() user: User,
    @Parent() story: Story
  ): Promise<boolean> {
    return this.loader.seen().load({ story, user })
  }

  @ResolveField('media', () => Media)
  async media(@Parent() story: Story): Promise<Media> {
    return this.loader.media().load(story)
  }

  @ResolveField('user', () => User)
  async user(@Parent() story: Story): Promise<User> {
    return this.loader.user().load(story)
  }

  @ResolveField('reactions', () => Reactions)
  async reactions(@Parent() story: Story): Promise<Reactions> {
    return this.loader.reactions().load(story)
  }
}
