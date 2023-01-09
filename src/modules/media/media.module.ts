import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Media } from './media.entity'
import { MediaResolver } from './media.resolver'
import { MediaService } from './media.service'

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  providers: [MediaResolver, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
