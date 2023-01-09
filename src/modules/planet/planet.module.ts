import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Planet } from './planet.entity'
import { PlanetService } from './planet.service'
import { PlanetLoader } from './planet.loader'
import { UserPlanet } from './userPlanet.entity'
import { PlanetResolver } from './planet.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Planet, UserPlanet])],
  providers: [PlanetService, PlanetLoader, PlanetResolver],
  exports: [PlanetService, PlanetLoader],
})
export class PlanetModule {}
