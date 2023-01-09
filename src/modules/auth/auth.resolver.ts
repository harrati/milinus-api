import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { random } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ReposService } from './../repos.service'
import { LibsService } from '../../libs/libs.service'
import {
  SignInArgs,
  SignUpArgs,
  SignInWithFacebookArgs,
  SignInWithAppleArgs,
  ForgotPasswordArgs,
  ResetPasswordArgs,
  SignInAdminArgs,
} from './auth.inputs'
import { UserSignIn, AdminSignIn } from './auth.types'
import { User } from '../user/user.entity'
import { UserLanguage, UserStatus } from '../user/user.types'

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly repos: ReposService,
    private readonly libs: LibsService
  ) {}

  @Mutation(() => UserSignIn)
  async signIn(@Args() args: SignInArgs): Promise<UserSignIn> {
    const { email, password } = args
    const user = await this.repos.user.findByEmail(email)

    if (!user || !user.password) throw new Error('wrong-credentials')
    if (user.facebookId || user.appleId) throw new Error('social-user')
    if (user.status === UserStatus.BANNED) throw new Error('user-banned')

    const arePasswordMatching = await this.libs.bcrypt.comparePasswords(
      password,
      user.password
    )
    if (!arePasswordMatching) throw new Error('wrong-credentials')

    this.repos.user.updateAndFetch(user, {
      lastLogin: new Date(Date.now()).toISOString(),
    })

    // create jwt token
    const token = this.libs.jwt.createJwtToken({
      uuid: user.uuid,
      role: 'USER',
    })

    return {
      user,
      token,
    }
  }

  @Mutation(() => AdminSignIn)
  async signInAdmin(@Args() args: SignInAdminArgs): Promise<AdminSignIn> {
    const { password, email } = args
    const admin = await this.repos.admin.findByEmail(email)

    // check if admin exist and if has registered localy
    if (!admin) throw new Error('not-found-user')
    if (!admin.password) throw new Error('not-found-user')

    // check if password are matching
    const arePasswordMatching = await this.libs.bcrypt.comparePasswords(
      password,
      admin.password
    )
    if (!arePasswordMatching) throw new Error('not-found-user')

    // update last login for admin
    const dateNow = new Date(Date.now()).toISOString()
    this.repos.admin.updateAdmin({ uuid: admin.uuid }, { lastLogin: dateNow })

    // create jwt token
    const token = this.libs.jwt.createJwtToken({
      uuid: admin.uuid,
      role: 'ADMIN',
    })

    return {
      admin,
      token,
    }
  }

  @Mutation(() => UserSignIn)
  async signUp(@Args() args: SignUpArgs): Promise<UserSignIn> {
    const { email, password, userName, ...data } = args

    const existingEmail = await this.repos.user.findByEmail(email)
    if (existingEmail) throw new Error('email-exists')

    const existingUsername = await this.repos.user.findByUserName(userName)
    if (existingUsername) throw new Error('userName-exists')

    const createdUser = await this.repos.user.createUser({
      email,
      password,
      userName,
      ...data,
    })
    const template =
      createdUser.language === UserLanguage.FR ? 'welcome' : 'welcomeEN'
    this.libs.mailjet.send(template, createdUser)
    const token = this.libs.jwt.createJwtToken({
      uuid: createdUser.uuid,
      role: 'USER',
    })
    return {
      user: createdUser,
      token,
    }
  }

  @Mutation(() => UserSignIn)
  async signInWithFacebook(
    @Args() args: SignInWithFacebookArgs
  ): Promise<UserSignIn> {
    const { userAccessToken } = args
    const isTokenValid = await this.libs.facebook.authenticateFacebookUser(
      userAccessToken
    )
    if (!isTokenValid) throw new Error('facebook-invalid-token')

    const {
      firstName,
      lastName,
      facebookId,
      email,
      facebookProfilePictureUrl,
    } = await this.libs.facebook.getFacebookUserData(userAccessToken)
    const existingFacebookUser = await this.repos.user.findByFacebookId(
      facebookId
    )

    if (existingFacebookUser) {
      return {
        user: existingFacebookUser,
        token: this.libs.jwt.createJwtToken({
          uuid: existingFacebookUser.uuid,
          role: 'USER',
        }),
      }
    }

    const existingUser = await this.repos.user.findByEmail(email)
    if (existingUser || !email) throw new Error('existing-email')

    const userName = `${firstName}${lastName}${random(1, 99)}`
    const userUuid = uuidv4()
    const pictureUrl = await this.libs.firebase.uploadImageFromUrl(
      facebookProfilePictureUrl,
      'userProfilePictures',
      userUuid
    )
    const user = await this.repos.user.createUser({
      uuid: userUuid,
      facebookId,
      email,
      firstName,
      lastName,
      userName,
      pictureUrl,
    })
    const template = user.language === UserLanguage.FR ? 'welcome' : 'welcomeEN'
    this.libs.mailjet.send(template, user)

    return {
      user,
      token: this.libs.jwt.createJwtToken({ uuid: user.uuid, role: 'USER' }),
    }
  }

  @Mutation(() => UserSignIn)
  async signInWithApple(
    @Args() args: SignInWithAppleArgs
  ): Promise<UserSignIn> {
    const {
      appleId,
      authorizationCode,
      firstName: userFirstName,
      lastName: userLastName,
    } = args
    const appleUser = await this.libs.apple.verifyAuthorizationCode(
      authorizationCode
    )

    if (!appleUser || appleId !== appleUser.appleId)
      throw new Error('apple-invalid-token')

    const existingAppleUser = await this.repos.user.findByAppleId(appleId)

    if (existingAppleUser) {
      return {
        user: existingAppleUser,
        token: this.libs.jwt.createJwtToken({
          uuid: existingAppleUser.uuid,
          role: 'USER',
        }),
      }
    }

    const { email } = appleUser
    const existingUser = await this.repos.user.findByEmail(email)
    if (existingUser) throw new Error('existing-email')

    const firstName = userFirstName || 'milinus'
    const lastName = userLastName || 'user'
    const userName = `${firstName}${lastName}${random(1, 99)}`

    const user = await this.repos.user.createUser({
      appleId,
      email,
      firstName,
      lastName,
      userName,
    })

    const template = user.language === UserLanguage.FR ? 'welcome' : 'welcomeEN'
    this.libs.mailjet.send(template, user)

    return {
      user,
      token: this.libs.jwt.createJwtToken({ uuid: user.uuid, role: 'USER' }),
    }
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args() args: ForgotPasswordArgs): Promise<boolean> {
    const { email } = args
    const user = await this.repos.user.createResetPasswordToken(email)
    const { resetPasswordToken } = user
    if (!resetPasswordToken) throw new Error()
    const dynamicLink = await this.libs.firebase.createDynamicLink(
      '/reset-password?resetPasswordToken',
      resetPasswordToken
    )
    const template =
      user.language === UserLanguage.FR ? 'resetPassword' : 'resetPasswordEN'
    this.libs.mailjet.send(template, user, { dynamicLink })
    return true
  }

  @Mutation(() => UserSignIn)
  async resetPassword(@Args() args: ResetPasswordArgs): Promise<UserSignIn> {
    const { resetPasswordToken, password } = args
    const user = await this.repos.user.resetPasswordToken(
      resetPasswordToken,
      password
    )
    return {
      user,
      token: this.libs.jwt.createJwtToken({ uuid: user.uuid, role: 'USER' }),
    }
  }

  @Mutation(() => Boolean)
  async forgotPasswordAdmin(@Args() args: ForgotPasswordArgs) {
    const { email } = args
    const admin = await this.repos.admin.createResetPasswordToken(email)
    const { resetPasswordToken } = admin
    if (!resetPasswordToken) throw new Error()
    const dynamicLink = this.libs.utils.generatePasswordResetLink(
      resetPasswordToken
    )
    this.libs.mailjet.send('resetPassword', admin, { dynamicLink })
    return true
  }

  @Mutation(() => AdminSignIn)
  async resetPasswordAdmin(@Args() args: ResetPasswordArgs) {
    const { resetPasswordToken, password } = args
    const admin = await this.repos.admin.resetPasswordToken(
      resetPasswordToken,
      password
    )
    return {
      admin,
      token: this.libs.jwt.createJwtToken({ uuid: admin.uuid, role: 'ADMIN' }),
    }
  }
}
