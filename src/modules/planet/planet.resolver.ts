import { Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { User } from '../user/user.entity'
import { ReposService } from '../repos.service'
import { AuthGuard } from '../../guards'
import { UseGuards } from '@nestjs/common'
import { CurrentUser } from '../../decorators'
import { Planet } from '../planet/planet.entity'
import { UserLanguage } from '../user/user.types'

@UseGuards(AuthGuard)
@Resolver(() => Planet)
export class PlanetResolver {
  constructor(private readonly repos: ReposService) {}

  @ResolveField('unlocked', () => Boolean)
  async unlocked(
    @Parent() planet: Planet,
    @CurrentUser() user: User
  ): Promise<boolean> {
    const userPlanet = await this.repos.planet.getUserPlanet(user, planet)
    return !!userPlanet
  }

  @ResolveField('nameTrans', () => String)
  async nameTrans(
    @Parent() planet: Planet,
    @CurrentUser() user: User
  ): Promise<string> {
    return user.language === UserLanguage.EN ? planet.nameEn : planet.name
  }

  @ResolveField('descriptionTrans', () => String)
  async descriptionTrans(
    @Parent() planet: Planet,
    @CurrentUser() user: User
  ): Promise<string> {
    return user.language === UserLanguage.EN
      ? planet.descriptionEn
      : planet.description
  }
}
