import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UtilsService {
  constructor(private readonly config: ConfigService) {}

  generatePasswordResetLink(resetPasswordToken: string) {
    const { api } = this.config.get('url')
    return `${api}/admin/reset-password?resetPasswordToken=${resetPasswordToken}`
  }

  generatePasswordCreateLink(resetPasswordToken: string) {
    const { api } = this.config.get('url')
    return `${api}/admin/activate-user?resetPasswordToken=${resetPasswordToken}`
  }
}
