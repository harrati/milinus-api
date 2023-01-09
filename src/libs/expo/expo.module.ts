import { ExpoService } from './expo.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [ExpoService],
  exports: [ExpoService],
})
export class ExpoModule {}
