import { Controller, Get, Query, Redirect } from '@nestjs/common'
import { ReposService } from '../repos.service'
import { ConfigService } from '@nestjs/config'

@Controller('admin')
export class AdminController {
  constructor(
    private readonly repos: ReposService,
    private readonly config: ConfigService
  ) {}

  @Get('reset-password')
  @Redirect('', 302)
  async resetPassword(@Query('resetPasswordToken') resetPasswordToken: string) {
    const { backOffice } = this.config.get('url')

    const isPasswordResetTokenValid = await this.repos.admin.isPasswordResetTokenValid(
      resetPasswordToken
    )

    if (!isPasswordResetTokenValid) {
      return { url: `${backOffice}?error=bad-token` }
    }
    return { url: `${backOffice}/reset-password?token=${resetPasswordToken}` }
  }

  @Get('activate-user')
  @Redirect('', 302)
  async activateUser(@Query('resetPasswordToken') resetPasswordToken: string) {
    const { backOffice } = this.config.get('url')

    const isPasswordResetTokenValid = await this.repos.admin.isPasswordResetTokenValid(
      resetPasswordToken
    )

    if (!isPasswordResetTokenValid) {
      return { url: `${backOffice}?error=bad-token` }
    }
    return { url: `${backOffice}/activate-user?token=${resetPasswordToken}` }
  }
}
