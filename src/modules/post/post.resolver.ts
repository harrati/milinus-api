import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql'
import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { UseGuards } from '@nestjs/common'
import { Post } from './post.entity'
import { PostConnection, CreatePostArgs } from './post.types'
import { WhereUniqueArgs } from '../../utils/types'
import { CurrentUser } from '../../decorators'
import { User } from '../user/user.entity'
import { PostArgs, ReactPostArgs, FeedsArgs } from './post.inputs'
import { PostLoader } from './post.loader'
import { Media } from '../media/media.entity'
import { Reactions } from '../story/story.types'
import { head } from 'lodash'

@UseGuards(AuthGuard)
@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly loader: PostLoader
  ) {}

  @Query(() => Post)
  async post(@Args() args: WhereUniqueArgs): Promise<Post> {
    return await this.repos.post.findByUuid(args.uuid)
  }

  @Query(() => PostConnection)
  async feeds(@Args() args: FeedsArgs) {
    const { orderby, duringthe, after, first, minstories } = args
    return await this.repos.post.getFeeds(
      orderby,
      duringthe,
      after,
      first,
      minstories
    )
  }

  @Query(() => PostConnection)
  userPosts(
    @CurrentUser() user: User,
    @Args() args: PostArgs
  ): Promise<PostConnection> {
    const { where } = args
    return this.repos.post.getUserFeed(where, user)
  }

  @Mutation(() => Post)
  async createPost(
    @CurrentUser() user: User,
    @Args() args: CreatePostArgs
  ): Promise<Post> {
    const storyArgs = {
      description: args.description,
      medias: [args.media],
    }
    const story = await this.repos.story.createStory(storyArgs, user)
    const postArgs = {
      ...args,
      story: head(story),
    }
    return this.repos.post.createPost(postArgs, user)
  }

  @Mutation(() => Post)
  async reactPost(
    @CurrentUser() user: User,
    @Args() args: ReactPostArgs
  ): Promise<Post> {
    const { where, data } = args
    const post = await this.repos.post.findByUuid(where.uuid)
    if (post.story) {
      this.repos.story.createReaction(post.story, data, user, false)
    }
    return this.repos.post.createReaction(post, data, user, true)
  }

  @Mutation(() => Boolean)
  async deletePost(
    @CurrentUser() user: User,
    @Args() args: WhereUniqueArgs
  ): Promise<boolean> {
    const post = await this.repos.post.findByUuid(args.uuid)
    const deleted = await this.repos.post.deleteFromUser(args.uuid, user)
    if (deleted && post.story) {
      await this.repos.story.deleteByUuid(post.story.uuid)
    }
    return true
  }

  @ResolveField('user', () => User)
  async user(@Parent() post: Post): Promise<User> {
    return this.loader.user().load(post)
  }

  @ResolveField('media', () => Media)
  async media(@Parent() post: Post): Promise<Media> {
    return this.loader.media().load(post)
  }

  @ResolveField('reactions', () => Reactions)
  async reactions(@Parent() post: Post): Promise<Reactions> {
    return this.loader.reactions().load(post)
  }
}
