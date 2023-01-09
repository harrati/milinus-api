import { Module, Global } from '@nestjs/common'
import { LibsService } from './libs.service'
import { BcryptModule } from './bcrypt/bcrypt.module'
import { JwtModule } from './jwt/jwt.module'
import { FacebookModule } from './facebook/facebook.module'
import { FirebaseModule } from './firebase/firebase.module'
import { MailjetModule } from './mailjet/mailjet.module'
import { PaginatorModule } from './paginator/paginator.module'
import { AppleModule } from './apple/apple.module'
import { UtilsModule } from './utils/utils.module'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { GraphqlFileFieldsInterceptor } from '../interceptors/graphql-file-fields.interceptor'
import { ImageModule } from './image/image.module'
import { ExpoModule } from './expo/expo.module'

@Global()
@Module({
  imports: [
    BcryptModule,
    JwtModule,
    FacebookModule,
    FirebaseModule,
    MailjetModule,
    PaginatorModule,
    AppleModule,
    UtilsModule,
    ImageModule,
    ExpoModule,
  ],
  providers: [
    LibsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphqlFileFieldsInterceptor,
    },
  ],
  exports: [LibsService],
})
export class LibsModule {}
