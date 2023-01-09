import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './group.entity'
import { GroupService } from './group.service'
import { GroupLoader } from './group.loader'
import { GroupResolver } from './group.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupService, GroupResolver, GroupLoader],
  exports: [GroupService],
})
export class GroupModule {}
