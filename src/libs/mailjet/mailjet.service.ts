/* eslint-disable @typescript-eslint/camelcase */
import mailjet, { Email } from 'node-mailjet'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '../../modules/user/user.entity'
import { Nullable, Either } from '../../utils/types'
import { MailjetConfig } from '../../config/config.types'
import { Admin } from '../../modules/admin/admin.entity'

export type Template =
  | 'resetPassword'
  | 'welcome'
  | 'createPassword'
  | 'contact'
  | 'deletedContent'
  | 'userBan'
  | 'dataRequest'
  | 'resetPasswordEN'
  | 'welcomeEN'
  | 'deletedContentEN'
  | 'userBanEN'
  | 'dataRequestEN'

@Injectable()
export class MailjetService {
  private mailer: Nullable<Email.Client>

  constructor(private readonly config: ConfigService) {
    const {
      credentials: { publicKey, privateKey },
    } = config.get<MailjetConfig>('mailjet')
    this.mailer = mailjet.connect(publicKey, privateKey)
  }

  prepareMail() {
    const env = this.config.get('env')
    if (env === 'test') return
    return this.config.get<MailjetConfig>('mailjet')
  }

  send(
    template: Template,
    user: Either<User, Admin>,
    payload?: object,
    attachments?: object
  ) {
    const { connectParams, requestParams, templates } = this.prepareMail()
    this.mailer.post('send', connectParams).request({
      Messages: [
        {
          From: {
            Email: requestParams.FromEmail,
            Name: requestParams.FromName,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstName,
            },
          ],
          TemplateLanguage: true,
          ...templates[template],
          Variables: {
            firstName: user.firstName,
            lastName: user.lastName,
            ...payload,
          },
          ...(attachments && { Attachments: attachments }),
        },
      ],
    })
  }

  sendContactMail(template: Template, payload: any) {
    const { connectParams, requestParams, templates } = this.prepareMail()

    this.mailer.post('send', connectParams).request({
      Messages: [
        {
          From: {
            Email: requestParams.FromEmail,
            Name: requestParams.FromName,
          },
          To: [
            {
              Email: requestParams.FromEmail,
              Name: requestParams.FromName,
            },
          ],
          TemplateLanguage: true,
          ...templates[template],
          Variables: {
            ...payload,
          },
        },
      ],
    })
  }
}
