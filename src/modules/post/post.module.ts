import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostReaction } from './postReaction.entity'
import { Post } from './post.entity'
import { PostService } from './post.service'
import { PostResolver } from './post.resolver'
import { PostLoader } from './post.loader'

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostReaction])],
  providers: [PostService, PostResolver, PostLoader],
  exports: [PostService],
})
export class PostModule {}
