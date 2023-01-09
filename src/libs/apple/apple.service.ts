import AppleSignIn from 'apple-sign-in-rest'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApplePayload } from './apple.types'
import { ReleaseConfig, AppleConfig } from '../../config/config.types'

@Injectable()
export class AppleService {
  private client: AppleSignIn

  constructor(private readonly configService: ConfigService) {
    const {
      teamId,
      keyIdentifier,
      privateKey: privateKeyB64,
    } = configService.get<AppleConfig>('apple')
    const {
      ios: { bundleId: clientId },
    } = configService.get<ReleaseConfig>('release')
    const privateKey = Buffer.from(privateKeyB64, 'base64').toString('ascii')
    this.client = new AppleSignIn({
      clientId,
      teamId,
      keyIdentifier,
      privateKey,
    })
  }

  async verifyAuthorizationCode(code: string): Promise<ApplePayload> {
    const clientSecret = this.client.createClientSecret({})

    const { id_token: idToken } = await this.client.getAuthorizationToken(
      clientSecret,
      code,
      {}
    )

    const { sub, email } = await this.client.verifyIdToken(idToken, {})

    return {
      email: email as string,
      appleId: sub,
    }
  }
}
