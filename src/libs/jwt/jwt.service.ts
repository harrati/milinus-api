import jwt from 'jsonwebtoken'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Either } from '../../utils/types'
import { JwtConfig } from '../../config/config.types'

type USER = 'USER'
type ADMIN = 'ADMIN'

export type Role = Either<USER, ADMIN>

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  createJwtToken(payload: { uuid: string; role: Role }): string {
    const { expiresIn, secret } = this.configService.get<JwtConfig>('jwt')
    const options = { expiresIn }
    return jwt.sign(payload, secret, options)
  }
}
