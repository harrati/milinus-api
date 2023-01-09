/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'
import { User } from '../../modules/user/user.entity'
import {
  FacebookMeData,
  FacebookTokenData,
  FacebookValidate,
} from './facebook.types'
import { FacebookConfig } from '../../config/config.types'

const graphEndpoint = 'https://graph.facebook.com/v6.0'
const tokenUrl = `${graphEndpoint}/debug_token`
const appTokenUrl = `${graphEndpoint}/oauth/access_token`
const fields = 'email,first_name,last_name,id,picture.width(500).height(500)'

@Injectable()
export class FacebookService {
  constructor(private readonly configService: ConfigService) {}

  async authenticateFacebookUser(userAccessToken: string): Promise<boolean> {
    const { clientId, clientSecret } = this.configService.get<FacebookConfig>(
      'facebook'
    )

    const {
      data: { access_token: appToken },
    } = await axios.get<FacebookTokenData>(
      `${appTokenUrl}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    )

    // check user token
    const {
      data: {
        data: { is_valid, app_id },
      },
    } = await axios.get<FacebookValidate>(
      `${tokenUrl}?input_token=${userAccessToken}&access_token=${appToken}`
    )
    return is_valid && app_id === clientId
  }

  async getFacebookUserData(
    accessToken: string
  ): Promise<
    Pick<User, 'email' | 'firstName' | 'lastName'> & {
      facebookId: string
      facebookProfilePictureUrl: string
    }
  > {
    const {
      data: { id, email, first_name, last_name, picture },
    } = await axios.get<FacebookMeData>(
      `${graphEndpoint}/me?access_token=${accessToken}&fields=${fields}`
    )

    return {
      email,
      facebookId: id,
      firstName: first_name,
      lastName: last_name,
      facebookProfilePictureUrl: picture.data.url,
    }
  }
}
