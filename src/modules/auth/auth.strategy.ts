import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { Role } from '../../libs/jwt/jwt.service'
import { JwtConfig } from '../../config/config.types'
import { ConfigService } from '@nestjs/config'

type PassportPayload = { uuid: string; role: Role }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly repos: ReposService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtConfig>('jwt').secret,
    })
  }

  async validate(payload: PassportPayload) {
    const user =
      payload.role === 'USER'
        ? await this.repos.user.findByUuid(payload.uuid)
        : null
    const admin =
      payload.role === 'ADMIN'
        ? await this.repos.admin.findByUuid(payload.uuid)
        : null

    return { user, admin }
  }
}
