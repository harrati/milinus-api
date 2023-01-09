import bcrypt from 'bcryptjs'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BcryptConfig } from '../../config/config.types'

@Injectable()
export class BcryptService {
  constructor(private readonly configService: ConfigService) {}

  async comparePasswords(
    candidatePassword: string,
    password: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(
        candidatePassword,
        password,
        (err: Error, match: boolean) => (err ? reject(err) : resolve(match))
      )
    })
  }

  async createCryptedPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const { salt } = this.configService.get<BcryptConfig>('bcrypt')
      bcrypt.genSalt(salt, (err: Error, salt: any) => {
        if (err) return reject(err)
        bcrypt.hash(password, salt, (err: Error, hash: string) =>
          err ? reject(err) : resolve(hash)
        )
      })
    })
  }
}
