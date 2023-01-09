import { defaultConfig } from './config'

export type Config = typeof defaultConfig
export type AppConfig = typeof defaultConfig.app
export type GraphQLConfig = typeof defaultConfig.graphql
export type TypeOrmConfig = typeof defaultConfig.typeorm
export type BcryptConfig = typeof defaultConfig.bcrypt
export type JwtConfig = typeof defaultConfig.jwt
export type FacebookConfig = typeof defaultConfig.facebook
export type AppleConfig = typeof defaultConfig.apple
export type FirebaseConfig = typeof defaultConfig.firebase
export type ReleaseConfig = typeof defaultConfig.release
export type MailjetConfig = typeof defaultConfig.mailjet
export type UrlConfig = typeof defaultConfig.url
export type AssetsConfig = typeof defaultConfig.assets
export type NotificationConfig = typeof defaultConfig.notification
