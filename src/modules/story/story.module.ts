import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Story } from './story.entity'
import { StoryResolver } from './story.resolver'
import { StoryService } from './story.service'
import { StoryReaction } from './storyReaction.entity'
import { StoryLoader } from './story.loader'
import { StoryView } from './storyView.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryReaction, StoryView])],
  providers: [StoryService, StoryResolver, StoryLoader],
  exports: [StoryService],
})
export class StoryModule {}
