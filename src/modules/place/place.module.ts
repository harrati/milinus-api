import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Place } from './place.entity'
import { PlaceResolver } from './place.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  providers: [PlaceResolver],
})
export class PlaceModule {}
