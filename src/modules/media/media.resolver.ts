import { Resolver, Query, Args } from '@nestjs/graphql'
import { MediaArgs } from './media.inputs'
import { Media } from './media.entity'

import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { UseGuards } from '@nestjs/common'

@Resolver(() => Media)
@UseGuards(AuthGuard)
export class MediaResolver {
  constructor(private readonly repos: ReposService) {}

  @Query(() => Media)
  media(@Args() args: MediaArgs): Promise<Media> {
    return this.repos.media.findByUuid(args.uuid)
  }
}
