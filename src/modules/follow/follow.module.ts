import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Follow } from './follow.entity'
import { FollowResolver } from './follow.resolver'
import { FollowService } from './follow.service'

@Module({
  imports: [TypeOrmModule.forFeature([Follow])],
  providers: [FollowResolver, FollowService],
  exports: [FollowService],
})
export class FollowModule {}
