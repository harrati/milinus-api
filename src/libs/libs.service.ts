import { Injectable, Inject } from '@nestjs/common'
import { BcryptService } from './bcrypt/bcrypt.service'
import { JwtService } from './jwt/jwt.service'
import { FacebookService } from './facebook/facebook.service'
import { FirebaseService } from './firebase/firebase.service'
import { MailjetService } from './mailjet/mailjet.service'
import { PaginatorService } from './paginator/paginator.service'
import { AppleService } from './apple/apple.service'
import { UtilsService } from './utils/utils.service'
import { ImageService } from './image/image.service'
import { ExpoService } from './expo/expo.service'

@Injectable()
export class LibsService {
  public constructor(
    @Inject(BcryptService) public readonly bcrypt: BcryptService,
    @Inject(JwtService) public readonly jwt: JwtService,
    @Inject(FacebookService) public readonly facebook: FacebookService,
    @Inject(FirebaseService) public readonly firebase: FirebaseService,
    @Inject(MailjetService) public readonly mailjet: MailjetService,
    @Inject(PaginatorService) public readonly paginator: PaginatorService,
    @Inject(AppleService) public readonly apple: AppleService,
    @Inject(UtilsService) public readonly utils: UtilsService,
    @Inject(ImageService) public readonly image: ImageService,
    @Inject(ExpoService) public readonly expo: ExpoService
  ) {}
}
