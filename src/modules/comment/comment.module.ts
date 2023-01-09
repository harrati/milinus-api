import { CommentService } from './comment.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentResolver } from './comment.resolver'
import { Comment } from './comment.entity'
import { CommentLoader } from './comment.loader'

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentService, CommentResolver, CommentLoader],
  exports: [CommentService],
})
export class CommentModule {}
