import { SystemService } from './system.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { System } from './system.entity'
import { SystemResolver } from './system.resolver'
import { PlanetModule } from '../planet/planet.module'
import { SystemLoader } from './system.loader'

@Module({
  imports: [TypeOrmModule.forFeature([System]), PlanetModule],
  providers: [SystemService, SystemResolver, SystemLoader],
  exports: [SystemService, SystemLoader],
})
export class SystemModule {}
